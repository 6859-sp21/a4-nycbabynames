# NYC Baby Names

## Write Up

### Data


### Design Decisions

A rationale for your design decisions. How did you choose your particular visual encodings, interaction, and animation techniques? What alternatives did you consider and how did you arrive at your ultimate choices?

**Page Layout:** We wanted our visualization to be very clean and concise, and thought that a single page layout best served our purposes. We wanted to include a sidebar to orient our audience to the data, and provide them some information on the data and what interactions are available. We contained all filters/toggles to the sidebar to leave the space for the visualization free of distractions. We also added a label in the top left corner of the visualization window so users don't have to re-look at the current set of toggles to know what they're looking at. It reduces the distance your eyes have to move to gather this information which we think allows our user to gain more from the visualization in a faster way. Similarly, we allowed our visualization window to be draggable and zoomable to give our user the full data exploration experience and the ability to zoom in and see the changes on smaller bubbles of names (the less common names), and a non-distracting reset button to reorient them to the bubble visualization in case they dragged or zoomed too far. 

**Bubbles:**

**Zooming & Tooltips:**

One piece of feedback that we received several times on the MVP was that the small names were difficult to read. We knew that this would
be a difficulty with the MVP. However we did not want to change the scaling or apply a nonlinear scaling as it would make it more difficult to
visually estimate the difference between the names. We chose to instead implement a tooltip and zooming/panning to the visualization. Zooming
and panning allows the user to zoom into specific areas and follow the changes of specific names or groups of names over time or for different
ethnicity.

The tooltip contains both redundant information from the visualization such as name and count along with new information such as the rank
and the change from the previous year. The redundant information allows for the user to easily view that information without zooming and
to compare counts between names on very different scales easier. We also considered adding more components to the tooltip such as a line
graph of the selection and national rank over time. We decided to not include this as we worried that this would clutter the tooltip and
make it overwhelming to the user. We chose to include the change from the previous year as it would give similar information while
being visually simpler.

**Transition In & Out**

The user can select different ethnicity groups and scrub through different years. An important part of our visualization is being able to
view how these selections modify the bubbles as the data changes. We found that it was difficult to determine exactly which elements entered
and exited the visualization on each parameter change. In order to help the user more clearly differentiate these changes we added two different
animations. The first was new bubbles start with a different color and fade in to match the other bubbles. Bubbles that leave the visualization
move to the right of the screen and then disappear. This makes it much easier for the user to understand which elements have entered or left
at a glance without needing to hyper-focus on the small bubbles during changes.

**Search View:** Naturally, we felt that people's first inclination is always "what's in it for them?". People always want to be able to relate to the data, and as such, we gave users the ability to search their name in the whole NYC dataset (note that in the regular visualization view, we only show the top 100 names). We contained the search bar in the sidebar, again to keep all the filters in one place and our visualization area clean. For the individual name search, we search the name using the currently applied filters (minus ethnicity) and decided on a horizontal bar chart visualizing counts versus ethnicities. The bars are scaled to the max value of the name across the years, so that when you scrub our time slider within this search view you can visually see the difference in counts grow or shrink in the same place. Similarly, we maintained the ordering of ethnicities across filter/name/year changes so that the user has a consistent encoding they can interpret easily (also color coded by the same ethnicity colors used in the bubbles). We felt that rank was important information as was the change in rank, and instead of displaying this as a bar chart or another visualization, we kept it clean by adding this information in a sentence below and the additional national data in another sentence below. This way the information is encapsulated to that set of filters and we don't bombard the user with extra information outside those filters. We had considered adding a trend graph of rank over time using the national data, however, we thought that this would be too many visualizations for one page, and we were also time constrained. 

### Development Process

An overview of your development process. Describe how the work was split among the team members. Include a commentary on the development process, including answers to the following questions: Roughly how much time did you spend developing your application (in people-hours)? What aspects took the most time?

**Division of Labor:**
We attempted to divide the work roughly evenly and minimize the amount of work that was sequential/dependent on others' work to complete.
Some of the primary tasks that members completed are described below.

Maggie
  - Implemented ethnicity selector
  - Fixed bug in preserving visualization between changes
  - Implemented panning & zooming
  - Implemented watermark displaying selection  

Tim
  - Implemented year selector
  - Worked on preserving visualization between changes to selectors
  - Implemented tooltip & augmented NYC dataset with SSA national rank

Ivana
  - Designed page structure and visualization bubbles
  - Prepped SSA dataset
  - Implemented name searching and the visualization displayed.

**Time Alloted:**

Roughly 50 person-hours.

One component of the visualization that took surprisingly long to implement was having the bubbles
stay in the same spot and grow/shrink rather than completely redrawing the visualization for
each change to the selection. This was because we were not very familiar with D3 and didn't
have any experience with the simulation component used to animate & pack the bubbles.
