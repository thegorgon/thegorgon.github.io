---
layout: project
title: a demonstration of k-means
---

This was a resurrection of an old exploration from several years ago, when I first became interested in how [k-means clustering](https://en.wikipedia.org/wiki/K-means_clustering) actually works. It's a perfect algorithm for visualization - easily translated into a two-dimensional plane, easy to incorporate color for cluster assignment, results in continuous and progressive movement, is pretty easy to implement and is quick to converge. When I resurrected this site, it was top of my list to re-implement.

Many visualizations of k-means (e.g. [my last attempt](/archive/kmeans), [1](http://tech.nitoyon.com/en/blog/2013/11/07/k-means/), [2](https://www.youtube.com/watch?v=gSt4_kcZPxE)), use a set of randomly placed points. This makes for easy implementation, but any clustering is haphazard - there's no real clusters to discover, just random variations. To better demonstrate the algorithm, including it's strengths and it's weaknesses, I decided to randomly pick actual "values" and then randomly place "observations" in a gaussian distribution around the actual value. The true values are rendered as large, partially transparent gray circles and observations are rendered as small black dots.

The algorithm randomly places clusters, rendered as colored circles. It then assigns observations to clusters, represented by changing the color of the observation to match the cluster. Clusters are moved to the [centroid](https://en.wikipedia.org/wiki/Centroid) of their assigned observations. Assignments are updated based on the new cluster positions and the cluster is moved to the new centroid. This process continues in a loop until the clusters settle and their movements in a given iteration fall below a certain threshhold.

Try it out! Play with different configurations. Try mismatching the cluster count and the value count to see how the clusters form between values. Use the "Error" control to see how more accurate measurements result in more accurate clustering. Notice how values that are very close together are difficult to distinguish with the clusters. Use the "rewind" button to re-run the algorithm with the same values and observations to see how the initial position of the clusters affects the outcome. Try increasing the observation count and see if more observations result in more accurate clustering.

Above all, enjoy!
