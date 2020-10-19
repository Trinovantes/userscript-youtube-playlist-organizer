import { IPlaylist } from './IPlaylist'
import { v4 as uuidv4 } from 'uuid'
import { EOL } from 'os'

// ----------------------------------------------------------------------------
// Constants
// ----------------------------------------------------------------------------

const UI_WAIT_TIME = 500
const MAX_UI_WAIT_ATTEMPTS = 10

const WATCH_LATER_LIST_ID = 'WL'
const LIKED_LIST_ID = 'LL'

// ----------------------------------------------------------------------------
// MenuStrings
// ----------------------------------------------------------------------------

enum MenuStrings {
    SAVE_TO_WATCH_LATER = 'SAVE_TO_WATCH_LATER',
    SAVE_TO_PLAYLIST = 'SAVE_TO_PLAYLIST',
    ADD_TO_QUEUE = 'ADD_TO_QUEUE',
    REMOVE_FROM = 'REMOVE_FROM',
}

type MenuStringMapping = {
    [key in MenuStrings]: string
}

const EnglishMenuStrings: MenuStringMapping = {
    [MenuStrings.SAVE_TO_WATCH_LATER]: 'Save to Watch later',
    [MenuStrings.SAVE_TO_PLAYLIST]: 'Save to playlist',
    [MenuStrings.ADD_TO_QUEUE]: 'Add to queue',
    [MenuStrings.REMOVE_FROM]: 'Remove from',
}

// ----------------------------------------------------------------------------
// PlaylistOrganizer
// ----------------------------------------------------------------------------

enum ActionTypes {
    ADD_PLAYLIST,
    ADD_WATCH_LATER,
    ADD_QUEUE,
    REMOVE_FROM,
}

export default class PlaylistOrganizer {
    currentPlaylist: IPlaylist | null = null
    playlists: Array<IPlaylist> = []
    menuStrings: MenuStringMapping = EnglishMenuStrings

    settingsRoot: JQuery<HTMLElement> | null = null
    dropzonesRoot: JQuery<HTMLElement> | null = null

    get isWatchLater(): boolean {
        return this.currentPlaylist?.id === WATCH_LATER_LIST_ID
    }

    constructor() {
        console.info(
            '-'.repeat(80) + EOL +
            'Initializing PlaylistOrganizer' + EOL +
            '-'.repeat(80) + EOL)
    }

    run(): void {
        window.addEventListener('yt-navigate-start', () => {
            this.removeUI()
        })

        window.addEventListener('yt-navigate-finish', () => {
            void this.reload()
        })

        void this.reload()
    }

    async reload(): Promise<void> {
        // Check if we're on a playlist page
        const re = /youtube\.com\/playlist\?list=([\w]+)/
        const matches = re.exec(location.href)
        if (!matches) {
            console.info('Not on a playlist page')
            return
        }

        try {
            this.removeUI()

            this.menuStrings = await loadSettings()
            this.createSettingsForm()

            this.playlists = await findPlaylistsInSidebar()
            this.determineCurrentPlaylist()
            this.createDropzones()
            this.registerDragListeners()
        } catch (e) {
            const error = e as Error
            console.error('PlaylistOrganizer', error)
            alert(error.message)
        }
    }

    private removeUI(): void {
        if (this.settingsRoot) {
            this.settingsRoot.remove()
            this.settingsRoot = null
        }

        if (this.dropzonesRoot) {
            this.dropzonesRoot.remove()
            this.dropzonesRoot = null
        }
    }

    private createSettingsForm(): void {
        const parent = $('ytd-page-manager#page-manager .ytd-browse[page-subtype="playlist"]')
        const root = $('<div id="playlist-organizer-settings-root">')
        const main = $('<div id="playlist-organizer-settings">')

        // eslint-disable-next-line no-lone-blocks
        {
            main.append('<h2>Menu Strings</h2>')
            main.append('<p>These case-sensitive values must match the strings in the video dropdown menu</p>')

            for (const prefixKey of Object.keys(MenuStrings)) {
                const val = this.menuStrings[prefixKey as MenuStrings]
                const defaultVal = EnglishMenuStrings[prefixKey as MenuStrings]

                const input = $(`<input type="text" placeholder="${defaultVal}">`)
                input.val(val)
                input.on('keyup', () => {
                    const newVal = input.val()?.toString() || ''
                    this.menuStrings[prefixKey as MenuStrings] = newVal
                    void GM.setValue(prefixKey, newVal)
                })

                main.append(input)
            }
        }
        {
            main.append('<h2>Reload</h2>')
            main.append('<p>Reload whenever you need to refresh the list of playlists or when new videos have been dynamically loaded</p>')

            const button = $('<button>Reload</button>')
            button.on('click', (event) => {
                event.preventDefault()
                void this.reload()
            })

            main.append(button)
        }

        root.append(main)
        parent.append(root)
        this.settingsRoot = root
    }

    private determineCurrentPlaylist(): void {
        const re = /youtube\.com\/playlist\?list=([\w]+)/
        const matches = re.exec(location.href)
        if (!matches) {
            return
        }

        const id = matches[1]
        const name = $('h1#title a.yt-simple-endpoint').text().trim() || $('#title-form #text-displayed').text().trim()
        console.info(`id:${id} name:${name}`)

        if (!id || !name) {
            throw new Error('Cannot determine current playlist')
        }

        this.currentPlaylist = { id, name }
        console.info('Currently on playlist:', this.currentPlaylist)
    }

    private createDropzones(): void {
        const parent = $('ytd-page-manager#page-manager .ytd-browse[page-subtype="playlist"]')
        const root = $('<div id="playlist-organizer-root">')
        const main = $('<div id="playlist-organizer">')

        this.createPlaylistZones(main)
        this.createSpecialZones(main)

        root.append(main)
        parent.append(root)
        this.dropzonesRoot = root
    }

    private createPlaylistZones(parent: JQuery<HTMLElement>): void {
        const playlists = this.playlists.sort((a, b) => {
            return a.name.localeCompare(b.name)
        })

        const container = $('<div class="action-group playlists">')

        for (const playlist of playlists) {
            // Can't add video to playlist it's already part of
            if (playlist.id === this.currentPlaylist?.id) {
                continue
            }

            container.append(this.createDropzone(ActionTypes.ADD_PLAYLIST, playlist.name))
        }

        parent.append(container)
    }

    private createSpecialZones(parent: JQuery<HTMLElement>): void {
        const container = $('<div class="action-group special-actions">')

        container.append(this.createDropzone(ActionTypes.REMOVE_FROM, 'Remove from List', 'remove'))
        container.append(this.createDropzone(ActionTypes.ADD_QUEUE, 'Add to Queue', 'add-queue'))

        if (!this.isWatchLater) {
            container.append(this.createDropzone(ActionTypes.ADD_WATCH_LATER, 'Add to Watch Later', 'add-watch-later'))
        }

        parent.append(container)
    }

    private registerDragListeners(): void {
        const videoRows = $('#contents > ytd-playlist-video-renderer')

        for (const videoRow of videoRows) {
            const elementId = uuidv4()

            $(videoRow).addClass('draggable-video')
            $(videoRow).attr('draggable', 'true')
            $(videoRow).attr('data-element-id', elementId)

            $(videoRow).off('dragstart')
            $(videoRow).on('dragstart', (event) => {
                event.originalEvent?.dataTransfer?.setData('elementId', elementId)
                $(videoRow).addClass('dragging')
            })

            $(videoRow).off('dragend')
            $(videoRow).on('dragend', () => {
                $(videoRow).removeClass('dragging')
            })
        }
    }

    private createDropzone(action: ActionTypes, name: string, cssClass?: string): JQuery<HTMLElement> {
        const dropzone = $(`<div class="dropzone">${name}</div>`)

        if (cssClass) {
            dropzone.addClass(cssClass)
        }

        for (const eventName of ['drop', 'dragover', 'dragenter', 'dragleave']) {
            dropzone.on(eventName, (event) => {
                event.preventDefault()
                event.stopPropagation()
            })
        }

        dropzone.on('dragenter', () => {
            dropzone.addClass('highlight')
        })

        dropzone.on('dragleave', () => {
            dropzone.removeClass('highlight')
        })

        dropzone.on('drop', (event) => {
            dropzone.removeClass('highlight')

            const elementId = event.originalEvent?.dataTransfer?.getData('elementId')
            console.info(`Received elementId:${elementId}`)

            if (!elementId) {
                return
            }

            this.triggerAction(action, name, elementId).catch((e) => {
                const error = e as Error
                console.error('Failed to trigger action', error.message)
                alert(error.message)
            })
        })

        return dropzone
    }

    private async triggerAction(action: ActionTypes, name: string, elementId: string): Promise<void> {
        const videoRow = $(`.draggable-video[data-element-id=${elementId}]`)

        const menuBtn = videoRow.find('#menu button')
        menuBtn.trigger('click')

        const menuLinks = await findDelayedElement('ytd-menu-popup-renderer #items > ytd-menu-service-item-renderer')

        switch (action) {
            case ActionTypes.ADD_PLAYLIST: {
                const actionLink = findLink(menuLinks, this.menuStrings[MenuStrings.SAVE_TO_PLAYLIST])
                actionLink.trigger('click')

                const popup = await findDelayedElement('ytd-popup-container ytd-add-to-playlist-renderer')

                // Since the popup UI is kept in the DOm and getting reused, we need to release the event loop so that
                // YouTube's JS can make run and update the popup's hooks before we interact with it
                await sleep(UI_WAIT_TIME)

                const playlistBtns = popup.find('#playlists > ytd-playlist-add-to-option-renderer')

                // Ensure we do not remove video without successfully adding the video elsewhere first
                let matched

                // Click the target playlist btn
                matched = false
                for (const btn of playlistBtns) {
                    const btnText = $(btn).find('#label').text()
                    if (btnText === name) {
                        const checkbox = await findDelayedElement('paper-checkbox', btn)
                        const isChecked = !!checkbox.attr('checked')
                        console.info(`Matched:"${btnText}" isChecked:${isChecked}`)

                        if (!isChecked) {
                            console.info(`Clicking:${btnText}`)
                            checkbox.trigger('click')
                        }

                        matched = true
                    }
                }

                if (!matched) {
                    throw new Error('Did not find button to click')
                }

                // Remove from current playlist
                matched = false
                for (const btn of playlistBtns) {
                    const btnText = $(btn).find('#label').text()
                    if (btnText === this.currentPlaylist?.name) {
                        const checkbox = await findDelayedElement('paper-checkbox', btn)
                        const isChecked = !!checkbox.attr('checked')
                        console.info(`Matched:"${btnText}" isChecked:${isChecked}`)

                        if (isChecked) {
                            console.info(`Clicking:${btnText}`)
                            checkbox.trigger('click')
                        }

                        matched = true
                    }
                }

                if (!matched) {
                    throw new Error('Did not find button to click')
                }

                const closeBtn = popup.find('#close-button button')
                closeBtn.trigger('click')
                videoRow.fadeOut()
                break
            }
            case ActionTypes.ADD_WATCH_LATER: {
                const actionLink = findLink(menuLinks, this.menuStrings[MenuStrings.SAVE_TO_WATCH_LATER])
                actionLink.trigger('click')
                break
            }
            case ActionTypes.ADD_QUEUE: {
                const actionLink = findLink(menuLinks, this.menuStrings[MenuStrings.ADD_TO_QUEUE])
                actionLink.trigger('click')
                break
            }
            case ActionTypes.REMOVE_FROM: {
                const actionLink = findLink(menuLinks, this.menuStrings[MenuStrings.REMOVE_FROM], true)
                actionLink.trigger('click')
                break
            }
        }
    }
}

// ----------------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------------

function sleep(timeout: number): Promise<void> {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve()
        }, timeout)
    })
}

function findLink(links: JQuery<HTMLElement>, menuString: string, isPrefix = false): JQuery<HTMLElement> {
    for (const link of links) {
        const a = $(link).text().trim()
        const b = menuString

        if (isPrefix) {
            if (a.startsWith(b)) {
                return $(link)
            }
        } else {
            if (a === b) {
                return $(link)
            }
        }
    }

    throw new Error(`Cannot find action with string:${menuString} isPrefix:${isPrefix}`)
}

async function loadSettings(): Promise<MenuStringMapping> {
    const menuStrings: {[key: string]: string} = {}

    for (const prefixKey of Object.keys(MenuStrings)) {
        const defaultVal = EnglishMenuStrings[prefixKey as MenuStrings]
        const val = await GM.getValue(prefixKey, '') || defaultVal
        menuStrings[prefixKey] = val
    }

    return menuStrings as MenuStringMapping
}

async function findPlaylistsInSidebar(): Promise<Array<IPlaylist>> {
    // Need to wait for YouTube to finish lazy loading
    const homeSection = await findDelayedElement('#contentContainer ytd-guide-section-renderer:nth-child(1)')

    const showMoreBtn = $(homeSection).find('ytd-guide-collapsible-entry-renderer #expander-item')
    showMoreBtn.trigger('click')

    const playlistLinks = await findDelayedElement('#expandable-items > ytd-guide-entry-renderer', homeSection)
    const playlists: Array<IPlaylist> = []

    for (const playlistLink of playlistLinks) {
        const name = $(playlistLink).text().trim()
        const href = $(playlistLink).find('a#endpoint').attr('href')

        // Skip playlists that failed to parse
        if (!name || !href) {
            continue
        }

        const matches = /playlist\?list=([\w]+)/.exec(href)
        if (!matches) {
            continue
        }

        const id = matches[1]

        // We can't modify Liked videos so we skip this list
        if (id.startsWith(LIKED_LIST_ID)) {
            continue
        }

        playlists.push({ id, name })
    }

    return playlists
}

async function findDelayedElement(selector: string, parent?: HTMLElement | JQuery<HTMLElement>): Promise<JQuery<HTMLElement>> {
    let attempts = 0
    while (attempts < MAX_UI_WAIT_ATTEMPTS) {
        let el
        if (parent) {
            el = $(parent).find(selector)
        } else {
            el = $(selector)
        }

        if (el.length > 0) {
            console.info(`Found ${selector}`, el)
            return el
        }

        // Exponential back off
        const delay = UI_WAIT_TIME * Math.pow(2, attempts)
        console.info(`Waiting ${delay}ms for "${selector}"`)
        await sleep(delay)
        attempts += 1
    }

    throw new Error(`Failed to find element with selector "${selector}"`)
}
