import { DRAG_EV_DATA_ATTR } from '../../Constants.ts'
import { findDelayedElement } from '../../utils/findDelayedElement.ts'
import { findDelayedElementAll } from '../../utils/findDelayedElementAll.ts'
import { sleep } from '../../utils/sleep.ts'

export type ActionType =
    | 'ADD_PLAYLIST'
    | 'ADD_WATCH_LATER'
    | 'ADD_QUEUE'
    | 'REMOVE'

export async function triggerAction(action: ActionType, elementId: string, targetPlaylistName: string, currentPlaylistName: string, clickDelay: number): Promise<void> {
    console.groupCollapsed(__NAME__, `triggerAction:${action}`)

    try {
        if (action === 'ADD_PLAYLIST' && currentPlaylistName === targetPlaylistName) {
            throw new Error(`Trying to add to same playlist "${currentPlaylistName}"`)
        }

        const videoRow = await findDelayedElement(`.draggable-video[${DRAG_EV_DATA_ATTR}="${elementId}"]`)
        const menuBtn = videoRow?.querySelector<HTMLElement>('#menu button')
        menuBtn?.click()
        await sleep(clickDelay)
        const menuLinks = await findDelayedElementAll('ytd-menu-popup-renderer #items > ytd-menu-service-item-renderer')

        switch (action) {
            case 'ADD_PLAYLIST': {
                console.info('targetPlaylistName:', targetPlaylistName)
                console.info('currentPlaylistName:', currentPlaylistName)

                const actionLink = menuLinks.filter((el) => el.querySelector<HTMLElement>('yt-formatted-string')?.textContent?.toLowerCase().startsWith('save to playlist'))[0]
                actionLink.click()

                // Since the popup UI is kept in the DOM and getting reused, we need to release the event loop so that
                // YouTube's JS can run and update the popup's hooks before we interact with it
                await sleep(clickDelay)
                const popup = await findDelayedElement('ytd-popup-container ytd-add-to-playlist-renderer')
                await sleep(clickDelay) // The list of playlists sometimes shuffle due to user behavior (e.g. most recent used shifts to top) so we need to wait for UI to update

                // Add video to target playlist first
                await toggleOption(popup, targetPlaylistName, true, clickDelay)

                // Remove video from current playlist
                await toggleOption(popup, currentPlaylistName, false, clickDelay)

                // Close popup
                const closeBtn = popup.querySelector<HTMLButtonElement>('#close-button button')
                closeBtn?.click()

                // Hide video afterwards
                videoRow?.remove()
                break
            }

            case 'ADD_WATCH_LATER': {
                const actionLink = menuLinks.filter((el) => el.querySelector<HTMLElement>('yt-formatted-string')?.textContent?.toLowerCase().startsWith('save to watch later'))[0]
                actionLink.click()
                break
            }

            case 'ADD_QUEUE': {
                const actionLink = menuLinks.filter((el) => el.querySelector<HTMLElement>('yt-formatted-string')?.textContent?.toLowerCase().startsWith('add to queue'))[0]
                actionLink.click()
                break
            }

            case 'REMOVE': {
                const actionLink = menuLinks.filter((el) => el.querySelector<HTMLElement>('yt-formatted-string')?.textContent?.toLowerCase().startsWith('remove from'))[0]
                actionLink.click()
                break
            }
        }
    } catch (err: unknown) {
        console.warn(err)
    }

    console.groupEnd()
}

async function toggleOption(popup: HTMLElement, targetPlaylistName: string, toEnable: boolean, clickDelay: number) {
    const playlistOptions = await findDelayedElementAll('#playlists > ytd-playlist-add-to-option-renderer', popup)
    const optionContainer = playlistOptions.find((option) => targetPlaylistName === option.querySelector('#label')?.textContent)
    if (!optionContainer) {
        throw new Error(`triggerAction() failed to find checkbox for "${targetPlaylistName}" to enable`)
    }

    const checkbox = await findDelayedElement('#checkboxContainer > #checkbox', optionContainer)
    await sleep(clickDelay) // Wait for UI to load before checking if it's checked

    const isChecked = checkbox.classList.contains('checked')
    const willClick = isChecked !== toEnable
    if (willClick) {
        checkbox.click()
    }

    console.info('toggleOption()', `targetPlaylistName:${targetPlaylistName} isChecked:"${isChecked}" toEnable:"${toEnable}" willClick:${willClick}`)
}
