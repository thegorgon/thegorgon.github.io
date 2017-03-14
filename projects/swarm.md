---
layout: project
title: an exploration of swarm behavior
---

I've long been fascinated by [swarm behavior](https://en.wikipedia.org/wiki/Swarm_behaviour) - flocks of birds, swarms of insects, ant colonies. It's incredible how very simple local rules of interaction between large numbers of objects can lead to complex global patterns. I've long wanted to explore swarm behavior and play with different configurations for local behavior and how they might affect the rise of global patterns. This visualization was a first attempt at that exploration.

The swarm members, rendered as little triangles, travel generally at a consistent speed, a motion I refer to as "swimming". They also rotate generally at a consistent rotational speed, a motion I'll refer to this rotation as "steering". To decide how to move, each step, the swarm members follow an algorithm similar to the [Boids program](https://en.wikipedia.org/wiki/Boids), following these rules in priority order:

1. **Fear**: Avoid predators by steering away from any predators close to you. When afraid, swarm members will steer and swim at faster than their standard speed. Swarm members following this rule render as a <strong style="color: #8E2800">dark red</strong>.
1. **Separation**: Avoid collisions by steering away from the [centroid](https://en.wikipedia.org/wiki/Centroid) of visible neighbors within an immediate "repulsion zone". Swarm members following this rule render as a <strong style="color: #FFB03B">dark yellow</strong>.
2. **Alignment**: Try to fly with your visible neighbors, steering towards the average heading of visible neighbors in your wider "alignment zone". Swarm members following this rule render as a <strong style="color: #2C5640">dark green</strong>.
3. **Cohesion**: Try to fly towards your other flock mates, steering towards the centroid of visible neighbors in your broad "attraction zone". Swarm members following this rule render as a <strong style="color: #1BE6EF">light blue</strong>.

To see the visibility zones rendered, change the "Draw Zones" heading to "true".

The result is a swarm pattern similar to that of a school of fish. The swarm forms into small groups of tightly packed members, who stay a steady distance apart. When these groups come into contact with each other, they either combine if their contact is gentle, or disrupt each other and form new groups. Over time, the end result is generally a single swarm or two, swimming in a constant direction.

To introduce "predators" and disturb the swarm, click on the canvas. The swarm will behave as though a predator is at that location for a half-second, disrupting any grouped swarms and emulating the behavior of tapping the glass on a fish tank.
