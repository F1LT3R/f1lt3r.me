---
title: 'Agile Insight: Time = Complexity'
permalink: agile-insight-time-equals-complexity
thumbnail: thumbnail_agile-insight-time-equals-complexity.jpg
featured: true
tags: [Agile, Scrum, Story Points, Time, Complexity]
excerpt: 'Many Agile teams use Story Points as the measure for both: the length in time to complete a task and complexity of engineering a task. But is this a redundant measure?'
authors: [F1LT3R]
type: article
---

Many Agile teams use Story Points as the measure for both:

- The length in time to complete a task
- The complexity of engineering a task

The idea is that over time, a team will normalize on some fuzzy, but shared idea of what a Story Point represents. That fuzzy, but shared idea will evolve over time. A task that takes three Story Points today may only take one Story Point in the future.

## Inconsistent Measures

**Each team is different, changing over time**

One team’s idea of a Story Point does not necessarily match another teams idea of a Story Point. This is a problem for the organization because variability in measures makes forecasting more unreliable. Forecasting is already unreliable enough.

Businesses place a high value on knowing how long it takes deliver software, and though it is not possible to know how long it really takes, the business can not act until it has counted the cost. Even though the cost is wrong, it’s closer than it was when you didn’t guess.

**So why make it harder for the organization by using an inconsistent measure?**

## Insight

> Time **already is** a consistent measure of Complexity

Complex tasks take longer than simple tasks. Simple tasks can be broken down more easily than complex tasks, therefore they can be shorter. Breaking complex tasks down is hard, and takes time.

If you have a simple task that takes a day, and a complex task that takes a day, both tasks add the same value to your average velocity.

So what does it mean that one task is simple and one is complex?

It only means time.

## Dimensions Not Leveraged

Lets examine our problem space from easiest to estimate, to hardest to estimate:

1. Simple tasks that are short
2. Simple tasks that are long
3. Complex tasks that are short
4. Complex tasks that are long

This problem space has two axis: Complexity and Time, yet both are overloaded into the single measure of the Story Point. If we really wanted to capture time and complexity as values we could leverage, we would be better off using two distinct variables.

## Losing The Dimension of Complexity

So what are we saying when we map Complexity and Time together?

Let `c = complexity`, `t = time` and `sp = Story Points`

1. Simple-Short: `1c + 1t = 2sp`
2. Simple-Long: `1c + 2t = 3sp`
3. Complex-Short: `2c + 1t = 3sp`
4. Complex-Long: `3c + 3t = 6sp`

In the example above, the Simple-Long task and the Complex-Short task are both estimated to be `3sp`. In this case, the engineers are estimating that both tasks will take a similar amount of effort.

Then some haunted soul is forced to calculate the average velocity of the team (story points per sprint), and use that average to gate how many stories can fit into the next sprint.

The multidimensional Story Point has now been boiled back down to the linear dimension of time.

You can add as many axis to your Story Points as you want, but you’re only leveraging one.

## Get Real, Use Days

The estimate for our Complex-Short task might be justified like this:

> “I think this should task should be quick, probably about a day, but there’s a couple of areas I’m not so sure about - it could get a little complex, so let’s say three Story Points.”

That `3sp` will be used to measure against points from another sprint, which maps to a value of time. So what you’re actually saying is:

> “That Short-Complex story will likely take me _three days_.”

… even though you did not provide your estimate in days.

# How Many Days?

What if we start asking this:

> “**How many days** do you think this story would take?”

Then you might answer:

> “About two or three days, so let’s say three to be safe.”

Now we have a measure of three days, or `3d`.

Because we are flattening Complexity down to Time anyway, we may as well just estimate in days.

No Agile magic required.

## Day Points - A Standard Measure

**A day means a day, for any team**

While it’s true that one team may be able to get more done in a day than another, at least everyone can use a standard measure to estimate future work: one day.

> `1d = one day's work`

**A day means a day, for any time**

One day still means “one day”, in two years. The same cannot be said for Story Points, they only mean something to a specific team at a specific time.

I recommend just using a point for a day.

It easier, and less pretentious.

> **Disclaimer:** Be careful using Day Points. Agile is a religion, and people are scared of decimals.
