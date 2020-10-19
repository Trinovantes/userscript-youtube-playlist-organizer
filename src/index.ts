'use strict'

import PlaylistOrganizer from './PlaylistOrganizer'

async function main() {
    await $.when($.ready)
    const organizer = new PlaylistOrganizer()
    organizer.run()
}

import '@css/main.scss'
void main()
