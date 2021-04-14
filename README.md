# NYC Baby Names

## Write Up

### Data


### Design Decisions

A rationale for your design decisions. How did you choose your particular visual encodings, interaction, and animation techniques? What alternatives did you consider and how did you arrive at your ultimate choices?

**Page Layout:**

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

**Search View:**

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
  - Designed page structure and vizualization bubbles
  - Prepped SSA dataset
  - Implemented name searching and the visualization displayed.

**Time Alloted:**

Roughly 50 person-hours.

One component of the visualization that took surprisingly long to implement was having the bubbles
stay in the same spot and grow/shrink rather than completely redrawing the visualization for
each change to the selection. This was because we were not very familiar with D3 and didn't
have any experience with the simulation component used to animate & pack the bubbles.
