# Drag drop image deshredder

Uses simple techniques to find strip size and pair strips. There are a
few issues I've seen (noted below), but this is a bit of fun and about completing the
challenge, not creating a tool.

## Strip size

Look at each integer multiple in a sensible range. Find the multiple
that has the highest average.

FIXME: need to choose lowest multiple that has the highest average - eg
64, 128 will have the same average as 32.

## Pairing

Once we've got the strips, look for the closest edge. I thought this'd
be enough, but it turned out some incorrect edges had a lower mean
difference than correct edges. Popping the data into R revealed this was
true only in that some high differences skewed the data. Taking the
bottom quartile of differences fixes this.

FIXME: some pathological images don't work. This shows the algorithm
isn't particularly clever, and likely needs to analyse the strips in way
similar to my manual R analysis, before choosing the range to compare.

## Presentation

All HTML5 + CSS3 goodness, tested in recent Chrome and FF. Drag'n'drop
is pretty fun, tho any API where you need to preventDefault on every
event handler could be improved...
