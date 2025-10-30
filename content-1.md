# Content

## Easy

1. CSS fixes
  1. Update the playlist to be scrollable
  2. Update the playlist so that only the list is scrollable and the 'Playlist' title and search bar remain fixed
  3. (Bonus) Ensure that the audio player container remains the same
2. Debugging search interaction
  1. Click on the search bar and continue typing until 'No streams found' or the audio player title shows as 'Now Playing'
  2. Update the component file so that the audio player title remains as the currently playing track

## Medium

1. Debugging rerenders
  1. Open devtools to the console
  2. Click on the search bar and type anything
  3. Observe that the 'Why am I getting logged' message is getting logged
  4. Why is it getting logged? How would you go about fixing this? (The fix would be to use React memo or to colocate components)
2. Implement 'Sort By' playlist filtering
  1. Add a 'Sort By' dropdown button on the right side of the search bar
  2. Add a 'Recently Added' and 'A to Z' list button options
  3. Add actions to update the sort state and item list accordingly


## Hard

1. Pagination
  1. Update the playlist so that the fetchMoreItems hook gets called when the playlist reaches the end of the list
  2. Update the playlist reducer to merge in paginated items to be saved into state

