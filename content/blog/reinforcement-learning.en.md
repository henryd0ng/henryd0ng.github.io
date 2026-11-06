## About this note

The full article is currently available in Chinese: **[Read the complete note →](/zh/blog/reinforcement-learning/)**. This page is an English reading guide, not a full translation. The reading-time estimate in the header refers to the main Chinese article; optional reasoning and self-tests take additional time.

## TL;DR

- Value is an average conditioned on a state and a policy, not a promise about one outcome.
- Sample count alone does not establish reliability: dependence, support coverage, and the quantity's range matter.
- Match the tool to the information available: direct samples, a source distribution, an unnormalized density, or data alone.
- Conditional expectation connects value prediction, denoising, and velocity regression, but does not by itself prove correct generation.
- Keep stationarity separate from mixing, sampling from optimization, and generative policies from reward-optimal policies.

## How to use the full note

A useful study note should support more than recognition while reading. It should let us explain a claim, name a necessary assumption, produce a counterexample, and transfer the idea to a new problem.

The Chinese article now has a [TL;DR](/zh/blog/reinforcement-learning/#tldr), visible **Recall** questions with answers hidden in native disclosures, and optional short proofs or proof roadmaps. The latter explicitly distinguish demonstrated reasoning from results quoted without a full proof. In particular, squared-error optimality is not presented as if it already proved the correctness of diffusion or flow dynamics.

On a first pass, follow the narrative and skip optional details. On a return visit, try the [retrieval and transfer exercises](/zh/blog/reinforcement-learning/#recall) before reopening the explanation. The goal is to reconstruct the reasoning, not repeat its wording.

## The two organizing questions

The note connects the first two reinforcement learning lectures through two questions:

- **What does an estimate from random experience mean, and when should we trust it?**
- **How can we obtain, reuse, or generate samples when the distribution we need is not directly accessible?**

A running robot-grasping example connects the concepts. Its scenarios and numbers are illustrative, not reported experimental results.

## Lecture 1: understanding uncertainty

**Conditional expectation** explains why a value function averages possible returns given a state and a policy. Under squared-error loss and appropriate integrability assumptions, it also gives the best prediction using the available information. Restricting predictions to linear functions is a different problem.

**Concentration inequalities** address the reliability of finite-sample estimates. The note distinguishes laws of large numbers, central-limit approximations, and finite-sample tail bounds. Assumptions matter: independent-sample guarantees cannot simply be applied to a stream of correlated robot observations.

**Markov dynamics** describe how distributions evolve. A stationary distribution is not a state where motion stops, and having a stationary distribution does not by itself guarantee convergence from every starting point. Mixing asks how quickly the process forgets its initial distribution.

**Bayesian learning** retains a distribution over unknown parameters rather than only a point estimate. In a partially observed system, a belief over hidden states is updated through dynamical prediction followed by Bayesian correction.

## Lecture 2: working with samples

**Direct sampling and Monte Carlo** separate two tasks: producing samples from the right distribution and using their average to estimate an expectation. Inverse-transform sampling and rejection sampling illustrate why knowing a density is not the same as having an efficient sampler.

**Importance sampling** reweights observations from a source distribution to answer a question about a target distribution. It requires adequate support coverage, and extreme weights can make the estimate unstable. In off-policy evaluation, correcting a full trajectory generally involves more than changing the weight of its final action.

**MCMC** reverses the first lecture's perspective: instead of finding the long-run distribution of a given chain, we construct a chain with a desired invariant distribution. Metropolis–Hastings, Gibbs, Langevin, and HMC offer different movement rules. Correct invariance, convergence, and practical mixing speed are separate questions; a high acceptance rate alone is not evidence of good exploration.

**Diffusion and Flow Matching** address a different setting: we have data samples, but no convenient target-density formula. Diffusion learns local denoising-related quantities across noise levels. Flow Matching learns a time-dependent velocity field that transports noise toward data. Probability paths, regression targets, and numerical samplers should be considered separately rather than reduced to a simple “stochastic versus deterministic” distinction.

## The connection worth keeping

The first lecture's conditional-expectation viewpoint reappears in the second lecture's generative models. With squared-error regression, a network learns a conditional average of its training labels: future returns for value prediction, noise-related labels for denoising, or reference velocities for Flow Matching.

Learning a local conditional-average field and transporting a random population is not the same as outputting a single global average action. This distinction is particularly useful when multiple grasping motions are valid but their direct average is not.

A generative action model also does not automatically optimize a task reward: representing a rich action distribution and learning a high-return policy remain different objectives.

## Basis and sharing policy

This is an independently worded learning note based on Ziyu Shao's ShanghaiTech University reinforcement learning lectures, *Randomness & Confidence: Probability, Concentration, and Markov Dynamics* and *Learning from Samples: Monte Carlo, MCMC, Diffusion, and Flow*, together with the accompanying handwritten notes.

The original slides, PDFs, handwritten pages, and slide screenshots are **not reproduced, hosted, or offered for download** on this site. The Chinese article emphasizes intuition and connections rather than extended derivations or a complete algorithm tutorial.
