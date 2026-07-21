# Known issues on cacnorthamerica.com itself

These are content bugs that already exist on the sister site today — independent of anything "moving" there from this repo. Listed separately so they can be handed to whoever maintains that site's content as a straightforward bug list.

## 1. Leadership bio duplication — **SISTER-SITE BUG**

Three of the five CACNA regional leaders — **Pastor David Adenodi, Ph.D.**, **Pastor Joseph Olawale**, and **Pastor Timothy Adelani** — have no bio in this repo's `lib/content/leadership.ts`. The reason isn't that no bio was written for them: it's that their individual profile pages on cacnorthamerica.com all currently display **Pastor Timothy Agbeja's bio, verbatim**, under their own names. This was confirmed directly (not a caching artifact) when this repo's content was originally researched.

**Needed:** three real, distinct bios written for Adenodi, Olawale, and Adelani, and the misattributed Agbeja text removed from their profile pages in the meantime.

## 2. Pastor Fasuyi's bio is unfinished — **SISTER-SITE BUG**

Pastor C. S. Fasuyi (Missions Director, CAC Nigeria & Overseas)'s profile page biography section is cut off mid-sentence on the live site. **Needed:** complete the bio.

## 3. Possible rendering artifact (low confidence, worth a quick look)

On cacnorthamerica.com's `/current-leaders/` page, the word "Latunde" appears run together directly after Olawale's and Adelani's names with no punctuation separating it from their titles (e.g. reading like "...OlawaleLatunde Regional Secretary..."). Most likely just a missing comma/line-break in that page's markup rather than anything actually wrong with the names or titles themselves — flagged for a quick look, not treated as confirmed.
