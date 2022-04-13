import { DATA_ATTR_ID } from '@/Constants'
import { findDelayedElement } from '@/utils/findDelayedElement'
import { sleep } from '@/utils/sleep'

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
