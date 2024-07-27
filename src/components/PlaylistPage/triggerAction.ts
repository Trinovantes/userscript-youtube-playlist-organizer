import { DRAG_EV_DATA_ATTR } from '@/Constants'
import { findDelayedElement } from '@/utils/findDelayedElement'
import { findDelayedElementAll } from '@/utils/findDelayedElementAll'
import { sleep } from '@/utils/sleep'

export enum ActionType {
    ADD_PLAYLIST,
    ADD_WATCH_LATER,
    ADD_QUEUE,
    REMOVE,
}

export async function triggerAction(action: ActionType, elementId: string, targetPlaylistName: string, currentPlaylistName: string, clickDelay: number): Promise<void> {
    const videoRow = await findDelayedElement(`.draggable-video[${DRAG_EV_DATA_ATTR}="${elementId}"]`)
    const menuBtn = videoRow?.querySelector<HTMLElement>('#menu button')
    menuBtn?.click()
    await sleep(clickDelay)

    const menuLinks = await findDelayedElementAll('ytd-menu-popup-renderer #items > ytd-menu-service-item-renderer')
    switch (action) {
        case ActionType.ADD_PLAYLIST: {
            const actionLink = menuLinks.filter((el) => el.querySelector<HTMLElement>('yt-formatted-string')?.textContent?.toLowerCase().startsWith('save to playlist'))[0]
            actionLink.click()

            // Since the popup UI is kept in the DOM and getting reused, we need to release the event loop so that
            // YouTube's JS can run and update the popup's hooks before we interact with it
            await sleep(clickDelay)

            const popup = await findDelayedElement('ytd-popup-container ytd-add-to-playlist-renderer')
            const playlistOptions = await findDelayedElementAll('#playlists > ytd-playlist-add-to-option-renderer', popup)

            // Add video to target playlist first
            await toggleOption(playlistOptions, targetPlaylistName, true)

            // Remove video from current playlist
            await toggleOption(playlistOptions, currentPlaylistName, false)

            // Close popup
            const closeBtn = popup.querySelector<HTMLButtonElement>('#close-button button')
            closeBtn?.click()

            // Hide video afterwards
            videoRow?.remove()
            break
        }

        case ActionType.ADD_WATCH_LATER: {
            const actionLink = menuLinks.filter((el) => el.querySelector<HTMLElement>('yt-formatted-string')?.textContent?.toLowerCase().startsWith('save to watch later'))[0]
            actionLink.click()
            break
        }

        case ActionType.ADD_QUEUE: {
            const actionLink = menuLinks.filter((el) => el.querySelector<HTMLElement>('yt-formatted-string')?.textContent?.toLowerCase().startsWith('add to queue'))[0]
            actionLink.click()
            break
        }

        case ActionType.REMOVE: {
            const actionLink = menuLinks.filter((el) => el.querySelector<HTMLElement>('yt-formatted-string')?.textContent?.toLowerCase().startsWith('remove from'))[0]
            actionLink.click()
            break
        }
    }
}

async function toggleOption(playlistOptions: Array<HTMLElement>, targetPlaylistName: string, toEnable: boolean) {
    for (const optionContainer of playlistOptions) {
        const optionText = optionContainer.querySelector('#label')?.textContent
        if (optionText !== targetPlaylistName) {
            continue
        }

        const checkbox = await findDelayedElement('#checkboxContainer > #checkbox', optionContainer)
        const isChecked = checkbox.classList.contains('checked')
        console.info(DEFINE.NAME, 'toggleOption()', `Matched:"${optionText}" isChecked:"${isChecked}" toEnable:"${toEnable}"`)

        if (isChecked !== toEnable) {
            console.info(DEFINE.NAME, 'toggleOption()', `Clicking:"${optionText}"`)
            checkbox.click()
        }

        return
    }

    throw new Error(`triggerAction() failed to find checkbox for "${targetPlaylistName}" to enable`)
}
