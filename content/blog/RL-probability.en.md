This page is an **English reading guide**, not a full translation. The complete Lecture 1 notes are available in Chinese:

**[Read RL-probability in Chinese](/zh/blog/rl-probability/)**

The notes follow *Randomness & Confidence: Probability, Concentration, and Markov Dynamics* from Ziyu Shao’s reinforcement learning course at ShanghaiTech University, with the accompanying handwritten explanations. The source slides, handwritten PDFs, and slide screenshots are not distributed.

## Scope of the full notes

1. **[Probability foundations](/zh/blog/rl-probability/#section-1):** sample spaces, events, random variables, conditional probability, Bayes’ rule, and marginalization for discrete and continuous variables.
2. **[Expectation and conditional expectation](/zh/blog/rl-probability/#section-2):** the reward hypothesis and vNM expected utility axioms; linearity; conditional random variables; the tower property; conditional and total variance; returns and value functions.
3. **[Projection geometry](/zh/blog/rl-probability/#section-3):** affine LLSE, unrestricted MMSE, the L² inner product, residual orthogonality and its converse, the squared-error decomposition, and the jointly Gaussian case.
4. **[Monte Carlo and concentration](/zh/blog/rl-probability/#section-4):** unbiasedness and variance, LLN versus CLT, Cauchy–Schwarz, Jensen, entropy and KL, Markov/Chebyshev/Chernoff, Hoeffding’s lemma and inequality, sub-Gaussianity, confidence radii, sample complexity, and a UCB preview. The statements and assumptions remain explicit even where proofs are omitted.
5. **[Markov dynamics I](/zh/blog/rl-probability/#section-5):** stochastic-process classifications, the Markov property versus time homogeneity, transition matrices, graph walks, Chapman–Kolmogorov, distribution evolution, and worked path-probability examples.
6. **[Markov dynamics II](/zh/blog/rl-probability/#section-6):** communicating classes, recurrence, transience, periodicity, stationarity, detailed balance, reversibility, total variation, mixing, bottlenecks and spectral gaps, with discounted occupancy distinguished from a stationary distribution.
7. **[Statistical inference](/zh/blog/rl-probability/#section-7):** likelihood and MLE, posterior distributions, MAP versus posterior mean, Beta–Binomial conjugacy, and the full discrete and continuous conjugate-model coverage, with parameterizations and necessary corrections.
8. **[Bayesian learning](/zh/blog/rl-probability/#section-8):** sequential updates, posterior prediction, a Thompson Sampling preview, and POMDP belief updates as Markov prediction followed by Bayesian correction.
9. **[Synthesis and exercises](/zh/blog/rl-probability/#section-9):** links across the lecture, worked self-tests, and further reading.

The article includes chapter navigation, properly typeset mathematics, numerical examples, and recall questions with initially collapsed answers. Lecture 2 will be treated separately under its own topic; it is not presented here as a completed sampling tutorial.
