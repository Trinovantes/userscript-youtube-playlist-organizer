import { DATA_ATTR_ID, DATA_TRANSFER_KEY, LIKED_LIST_ID } from '@/Constants'
import { sleep, waitDelayedPredicate } from '@/utils'

export interface Playlist {
    youtubeId: string
    name: string
}

export function determineIsOnPlaylistPage(): boolean {
    const re = /youtube\.com\/playlist\?list=([\w]+)/
    const matches = re.exec(location.href)
    return !!matches
}

export function determineCurrentPlaylist(): Playlist | null {
    const re = /youtube\.com\/playlist\?list=([\w]+)/
    const matches = re.exec(location.href)
    if (!matches) {
        return null
    }

    const youtubeId = matches[1]
    const name = $('h1#title a.yt-simple-endpoint').text().trim() || $('#title-form #text-displayed').text().trim()
    console.info(DEFINE.NAME, 'determineCurrentPlaylist()', `youtubeId:"${youtubeId}" name:"${name}"`)

    if (!youtubeId || !name) {
        return null
    }

    return { youtubeId, name }
}

export enum ActionType {
    ADD_PLAYLIST,
    ADD_WATCH_LATER,
    ADD_QUEUE,
    REMOVE,
}

export async function triggerAction(action: ActionType, elementId: string, targetPlaylistName: string, currentPlaylistName: string): Promise<void> {
    const $videoRow = $(`.draggable-video[${DATA_ATTR_ID}=${elementId}]`)

    const $menuBtn = $videoRow.find('#menu button')
    $menuBtn.trigger('click')

    const $menuLinks = await findDelayedElement('ytd-menu-popup-renderer #items > ytd-menu-service-item-renderer')

    switch (action) {
        case ActionType.ADD_PLAYLIST: {
            const $actionLink = $($menuLinks.filter('[has-separator]'))
            $actionLink.trigger('click')

            const $popup = await findDelayedElement('ytd-popup-container ytd-add-to-playlist-renderer')

            // Since the popup UI is kept in the DOM and getting reused, we need to release the event loop so that
            // YouTube's JS can make run and update the popup's hooks before we interact with it
            await sleep(1)

            const $playlistOptions = await findDelayedElement('#playlists > ytd-playlist-add-to-option-renderer', $popup)

            // Add video to target playlist first
            let enabled = false
            for (const optionContainer of $playlistOptions) {
                const optionText = $(optionContainer).find('#label').text()
                if (optionText !== targetPlaylistName) {
                    continue
                }

                await toggleOption(optionContainer, true)
                enabled = true
                break
            }

            if (!enabled) {
                throw new Error(`triggerAction() failed to find checkbox for "${targetPlaylistName}" to enable`)
            }

            // Remove video from current playlist
            let disabled = false
            for (const optionContainer of $playlistOptions) {
                const optionText = $(optionContainer).find('#label').text()
                if (optionText !== currentPlaylistName) {
                    continue
                }

                await toggleOption(optionContainer, false)
                disabled = true
                break
            }

            if (!disabled) {
                throw new Error(`triggerAction() failed to find checkbox for "${currentPlaylistName}" to disable`)
            }

            const $closeBtn = $popup.find('#close-button button')
            $closeBtn.trigger('click')
            $videoRow.fadeOut()
            break
        }

        case ActionType.ADD_WATCH_LATER: {
            const $actionLink = $($menuLinks[1])
            $actionLink.trigger('click')
            break
        }

        case ActionType.ADD_QUEUE: {
            const $actionLink = $($menuLinks[0])
            $actionLink.trigger('click')
            break
        }

        case ActionType.REMOVE: {
            const $actionLink = $($menuLinks.filter('[has-separator]').next())
            $actionLink.trigger('click')
            break
        }
    }
}

let counter = 0
export function registerDragListeners(): void {
    const videoRows = $('#contents.ytd-playlist-video-list-renderer > ytd-playlist-video-renderer')

    for (const videoRow of videoRows) {
        const elementId = (counter++).toString()

        $(videoRow).addClass('draggable-video')
        $(videoRow).attr('draggable', 'true')
        $(videoRow).attr(DATA_ATTR_ID, elementId)

        $(videoRow).off('dragstart')
        $(videoRow).on('dragstart', (event) => {
            event.originalEvent?.dataTransfer?.setData(DATA_TRANSFER_KEY, elementId)
            $(videoRow).addClass('dragging')
        })

        $(videoRow).off('dragend')
        $(videoRow).on('dragend', () => {
            $(videoRow).removeClass('dragging')
        })
    }
}

export async function findPlaylistsInSidebar(): Promise<Array<Playlist>> {
    // Need to wait for YouTube to finish lazy loading
    const $homeSection = await findDelayedElement('#contentContainer ytd-guide-section-renderer:nth-child(1)')
    if (!$homeSection) {
        throw new Error('Cannot find playlist container')
    }

    const $showMoreBtn = $homeSection.find('ytd-guide-collapsible-entry-renderer #expander-item')
    $showMoreBtn.trigger('click')

    const $playlistLinks = await findDelayedElement('#expandable-items > ytd-guide-entry-renderer', $homeSection)
    if (!$playlistLinks) {
        throw new Error('Cannot find playlists inside container')
    }

    const playlists: Array<Playlist> = []

    for (const playlistLink of $playlistLinks) {
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

        const youtubeId = matches[1]

        // We can't modify Liked videos so we skip this list
        if (youtubeId.startsWith(LIKED_LIST_ID)) {
            continue
        }

        playlists.push({ youtubeId, name })
    }

    return playlists
}

async function findDelayedElement(selector: string, parent?: HTMLElement | JQuery<HTMLElement>): Promise<JQuery<HTMLElement>> {
    let target: JQuery<HTMLElement> | null = null

    await waitDelayedPredicate(() => {
        if (parent) {
            target = $(parent).find(selector)
        } else {
            target = $(selector)
        }

        if (target.length > 0) {
            console.info(DEFINE.NAME, 'findDelayedElement()', `Found "${selector}"`, target)
            return true
        } else {
            return false
        }
    })

    if (!target) {
        throw new Error(`findDelayedElement() failed to find "${selector}"`)
    }

    return target
}

async function toggleOption(optionContainer: HTMLElement, shouldBeChecked: boolean) {
    const optionText = $(optionContainer).find('#label').text()
    const checkbox = await findDelayedElement('#checkboxContainer > #checkbox', optionContainer)
    const isChecked = checkbox.hasClass('checked')

    console.info(DEFINE.NAME, 'toggleOption()', `Matched:"${optionText}" isChecked:"${isChecked}" shouldBeChecked:"${shouldBeChecked}"`)

    if (isChecked !== shouldBeChecked) {
        console.info(DEFINE.NAME, 'toggleOption()', `Clicking:"${optionText}"`)
        checkbox.trigger('click')
    }
}
