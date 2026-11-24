These are my notes on the first lecture of Ziyu Shao's reinforcement learning course at ShanghaiTech University, *Randomness & Confidence: Probability, Concentration, and Markov Dynamics*. I follow the eight topics in the lecture and its handwritten notes, then bring them together in a ninth chapter of worked exercises. The explanations and calculations here stand on their own. I have omitted the original slides, handwritten pages, and screenshots.

**What does a value estimate average? How much can we trust it? How do states evolve? How should new evidence change a belief?** These questions recur throughout reinforcement learning. An agent learns from a sequence of dependent observations, and the actions it chooses today change the data it can collect tomorrow.

<aside class="study-tldr" aria-labelledby="tldr">
<h2 id="tldr">TL;DR</h2>
<ol>
<li><strong>Value is an expectation given the available information.</strong> Under squared loss, conditional expectation is also the optimal prediction. Projection geometry explains residual orthogonality, the tower property, and variance decomposition.</li>
<li><strong>An average needs an error guarantee.</strong> MC turns an expectation into a sample mean. The LLN, CLT, and concentration inequalities address limits, asymptotic shape, and finite-sample tail probabilities, respectively. Independence, moment conditions, and the range of returns must not be omitted.</li>
<li><strong>State evolution and long-run behavior are two different levels of analysis.</strong> A transition matrix gives multistep distributions. Recurrence, irreducibility, periodicity, stationarity, and mixing answer different questions. Finding a stationary vector alone does not establish convergence.</li>
<li><strong>Bayesian inference retains a full representation of uncertainty.</strong> The posterior supports parameter estimation, prediction, and Thompson Sampling. A POMDP belief connects Markov prediction with a Bayes correction.</li>
</ol>
<p>For concentration inequalities, I retain the full conclusions, assumptions, and uses while omitting lengthy proofs. Other key arguments and worked examples appear in their respective chapters. Each chapter's Recall answers are collapsed by default.</p>
</aside>

<nav class="article-toc" aria-label="Lecture contents">
<h2>Lecture contents</h2>
<ol>
<li><a href="#section-1">Probability review: random variables, Bayes, and total probability</a></li>
<li><a href="#section-2">Expectation and conditional expectation: utility, the tower property, total variance, and value</a></li>
<li><a href="#section-3">LLSE, MMSE, and projection geometry</a></li>
<li><a href="#section-4">Monte Carlo and concentration: CS, Jensen, entropy, KL, tail bounds, and UCB</a></li>
<li><a href="#section-5">Markov I: stochastic processes, transition matrices, and multistep calculations</a></li>
<li><a href="#section-6">Markov II: state classification, stationarity, reversibility, and mixing</a></li>
<li><a href="#section-7">Statistical inference: MLE, MAP, posterior means, and conjugate models</a> (<a href="#section-7-7">discrete</a> / <a href="#section-7-8">continuous</a>)</li>
<li><a href="#section-8">Bayesian learning: posterior prediction, Thompson Sampling, and POMDPs</a></li>
<li><a href="#section-9">Connections, integrated exercises, and further reading</a></li>
</ol>
</nav>

**Notation.** $\mathbb P$ or $\Pr$ denotes probability, and $\mathbb E$ denotes expectation. Distribution vectors are written as row vectors. In RL, $\pi(a\mid s)$ denotes a policy. In the Markov chain chapters, $\pi_i$ denotes a stationary distribution. The context distinguishes them. Mathematical identities assume the integrability or square-integrability conditions stated in the text. "Almost everywhere" allows exceptions on sets of probability zero.

## 1. Probability review: from a random world to a computable model

This chapter corresponds to pages 9–16 of the first lecture. Probability theory derives the behavior of events and numerical quantities from a given model. Statistical inference works backward from observed data to models, parameters, or beliefs. Reinforcement learning connects the two: an agent uses a model to predict the future and make decisions, and those decisions change the data it subsequently obtains.

### 1.1 Sample spaces, events, and random variables

Write the complete outcome of a random experiment as $\omega$. All possible outcomes form the sample space $\Omega$. An event is a set of outcomes we care about, such as "the grasp succeeds". A probability measure $\mathbb P$ assigns probabilities to events. Formally, a probability space is written as $(\Omega,\mathcal F,\mathbb P)$, where $\mathcal F$ is the collection of events we can discuss. Probabilities are nonnegative, $\mathbb P(\Omega)=1$, and countable additivity holds for countable collections of pairwise disjoint events.

A random variable is not simply "a letter that varies at random." It is a measurable function that turns an experimental outcome into a numerical value:

$$
X:\Omega\longrightarrow\mathbb R,\qquad \omega\longmapsto X(\omega).
$$

The slides illustrate this mapping with the maximum of two die rolls: the original outcome is an ordered pair, while $X$ retains only the larger number. If the two dice are independent and fair, and each has faces $1,2,3,4$, the 16 ordered pairs are equally likely. There are $k^2$ outcomes whose maximum is at most $k$, so we can fill in the calculation:

$$
\mathbb P(X\le k)=\frac{k^2}{16},\qquad
\mathbb P(X=k)=\frac{k^2-(k-1)^2}{16}=\frac{2k-1}{16},\quad k=1,2,3,4.
$$

The probabilities of the four possible values are therefore $1/16,3/16,5/16,7/16$. Equally likely original outcomes need not remain equally likely after a function maps them to numerical values.

For a discrete random variable, the probability mass function (PMF) is $p_X(x)=\mathbb P(X=x)$. The cumulative distribution function (CDF) is $F_X(x)=\mathbb P(X\le x)$. If the distribution has a probability density function (PDF) $f_X$, then

$$
F_X(x)=\int_{-\infty}^{x}f_X(u)\,du.
$$

The density itself is not the probability of an individual point. A continuous random variable typically has $\mathbb P(X=x)=0$, even though $f_X(x)$ can be positive.

We call $X,Y$ independent if $\mathbb P(X\in B,Y\in C)=\mathbb P(X\in B)\mathbb P(Y\in C)$ for all measurable sets $B,C$. In the discrete case, the joint PMF factors into the product of the marginal PMFs. When a joint density exists, independence can likewise be characterized by the joint density equaling the product of the marginal densities. Independence is more than "looking unrelated" in one set of samples.

RL involves the same kinds of random quantities: the state $S_t$, action $A_t$, next reward $R_{t+1}$, and next state $S_{t+1}$. A single interaction record is usually written as $(S_t,A_t,R_{t+1},S_{t+1})$. Even given the current state and action, the reward and next state may remain random. The policy itself may also select actions randomly.

### 1.2 Conditional probability and Bayes' rule

If $\mathbb P(B)>0$, conditional probability is defined as

$$
\mathbb P(A\mid B)=\frac{\mathbb P(A\cap B)}{\mathbb P(B)}.
$$

The same joint event can be factored in two directions:

$$
\mathbb P(A\cap B)=\mathbb P(B\mid A)\mathbb P(A)
=\mathbb P(A\mid B)\mathbb P(B).
$$

Thus, whenever the relevant conditional probabilities are defined,

$$
\mathbb P(A\mid B)
=\frac{\mathbb P(B\mid A)\mathbb P(A)}{\mathbb P(B)}.
$$

From an inference perspective, $\mathbb P(A)$ is the prior before seeing the evidence, $\mathbb P(B\mid A)$ is the likelihood of evidence $B$ under hypothesis $A$, $\mathbb P(B)$ is the marginal probability of the evidence, and $\mathbb P(A\mid B)$ is the posterior. Likelihood and posterior are not interchangeable: a detector that often raises an alarm when an object slips does not imply that the object must be slipping whenever an alarm sounds. We also need to account for how common slipping is in the first place.

The slides also give four forms of Bayes' rule for combinations of discrete and continuous variables. Throughout, treat $X=x$ as the observation and $Y$ as the quantity to be inferred:

| Type of $X$ | Type of $Y$ | Bayes update |
| --- | --- | --- |
| Discrete | Discrete | $\displaystyle \mathbb P(Y=y\mid X=x)=\frac{\mathbb P(X=x\mid Y=y)\mathbb P(Y=y)}{\mathbb P(X=x)}$ |
| Discrete | Continuous | $\displaystyle f_{Y\mid X}(y\mid x)=\frac{\mathbb P(X=x\mid Y=y)f_Y(y)}{\mathbb P(X=x)}$ |
| Continuous | Discrete | $\displaystyle \mathbb P(Y=y\mid X=x)=\frac{f_{X\mid Y}(x\mid y)\mathbb P(Y=y)}{f_X(x)}$ |
| Continuous | Continuous | $\displaystyle f_{Y\mid X}(y\mid x)=\frac{f_{X\mid Y}(x\mid y)f_Y(y)}{f_X(x)}$ |

These expressions require positive denominators and the existence of the corresponding densities. In the continuous case, conditioning is understood through densities or regular conditional distributions, not by applying ordinary probability division directly to an event of probability zero. Different versions of a conditional distribution may differ at observations of probability zero.

### 1.3 The law of total probability: averaging over hidden groups

If $A_1,\ldots,A_m$ are pairwise disjoint, cover the sample space, and each has positive probability, then

$$
\mathbb P(B)=\sum_{i=1}^{m}\mathbb P(B\mid A_i)\mathbb P(A_i).
$$

In other words, the overall probability of an event is its conditional probability within each group, weighted by that group's proportion. Writing the grouping variable as $Y$ gives the four marginalization formulas in the slides:

| Type of $X$ | Type of $Y$ | Marginalizing over $Y$ |
| --- | --- | --- |
| Discrete | Discrete | $\displaystyle \mathbb P(X=x)=\sum_y\mathbb P(X=x\mid Y=y)\mathbb P(Y=y)$ |
| Discrete | Continuous | $\displaystyle \mathbb P(X=x)=\int\mathbb P(X=x\mid Y=y)f_Y(y)\,dy$ |
| Continuous | Discrete | $\displaystyle f_X(x)=\sum_y f_{X\mid Y}(x\mid y)\mathbb P(Y=y)$ |
| Continuous | Continuous | $\displaystyle f_X(x)=\int f_{X\mid Y}(x\mid y)f_Y(y)\,dy$ |

Bayes' rule reverses the direction of conditioning. The law of total probability removes a variable that no longer needs to be retained explicitly. We will repeatedly use both operations when computing next-state distributions, posterior predictions, and beliefs about hidden states.

### 1.4 Probability can also express uncertainty in our knowledge

The Bayesian view uses probability distributions to describe "what we do not yet know." This does not require a real-world parameter to change from trial to trial: a coin's success probability may be fixed while our knowledge of it remains uncertain.

The prior, evidence, and posterior are not three unrelated numbers. The diagram in the slides that changes a probability from 30% to 70% illustrates the updating mechanism. To actually calculate such a change, we must also specify the likelihood and evidence model. Merely "seeing new information" does not justify changing a number arbitrarily.

<div class="recall-block">

**Recall | Answer first, then check**

1. If the original outcomes of two fair dice are equally likely, why are their maximum values not equally likely? Answer in terms of "how many outcomes lie in each preimage."
2. Does a high $\mathbb P(\text{alarm}\mid\text{slipping})$ directly imply a high $\mathbb P(\text{slipping}\mid\text{alarm})$? Which quantities are missing?

<details class="recall-answer">
<summary>Check the answers</summary>
<div class="disclosure-body">

For the first question, count the original outcomes mapped to each value. For the second, we also need the prior probability of slipping and the probability of an alarm when there is no slipping, or, equivalently, the marginal probability of the evidence.

</div>
</details>
</div>

## 2. Expectation and conditional expectation: what exactly does a value function average?

This chapter corresponds to pages 18–39. Unless stated otherwise, the identities below for ordinary and conditional expectation assume that the relevant random variables are integrable, meaning that their absolute values have finite expectations. Variance and squared error additionally require finite second moments.

### 2.1 From the reward hypothesis to expected utility

RL often organizes tasks around the reward hypothesis: express the objective as maximizing expected cumulative reward. This should be understood as a modeling paradigm, not as a proof that every real-world objective must equal some sum of rewards. How to define rewards, whether constraints have been omitted, and whether risk preferences are represented appropriately remain modeling questions.

The von Neumann–Morgenstern expected utility theorem on page 19 concerns risk preferences that satisfy specific axioms. Let a lottery $L$ produce outcome $x_i$ with probability $p_i$, and write $L\succeq M$ when the decision-maker considers $L$ at least as good as $M$. For lotteries over finitely many outcomes, the standard axioms include:

1. **Completeness:** any two lotteries can be compared. Indifference is allowed.
2. **Transitivity:** if $L\succeq M$ and $M\succeq N$, then $L\succeq N$.
3. **Continuity:** if $L\succ M\succ N$, there is an $\alpha\in(0,1)$ such that $M$ is indifferent to $\alpha L+(1-\alpha)N$. A mixture here means choosing a lottery probabilistically, not directly averaging the numerical outcomes.
4. **Independence:** for any lottery $N$ and $\alpha\in(0,1)$, mixing the same $N$ into both sides in the same proportion preserves the preference ordering:

$$
L\succeq M\quad\Longleftrightarrow\quad
\alpha L+(1-\alpha)N\succeq\alpha M+(1-\alpha)N.
$$

Under these axioms, preferences can be represented by the expectation of an outcome utility $u(x)$. If $M$ assigns probabilities $q_i$ to the same outcomes, then

$$
L\succeq M\quad\Longleftrightarrow\quad
\sum_i p_i u(x_i)\ge\sum_i q_i u(x_i).
$$

The numerical scale of utility is not unique: $\widetilde u=au+b$, with $a>0$, produces the same ordering of lotteries. The independence axiom here concerns the compatibility of preferences with lottery mixtures. It is not the sampling assumption that random variables are independent.

The risk example in the slides offers a safe option that yields 0 for certain, and a risky option that yields $+10$ or $-10$ with equal probability. Both have an expected monetary payoff of 0, but if $u$ is strictly concave on the relevant interval, then

$$
\frac{u(10)+u(-10)}2<u(0).
$$

Such a decision-maker prefers the safe option. Linear utility corresponds to risk neutrality. Convex utility may favor risk. Equal expected monetary payoffs therefore do not imply equal expected utilities.

Replacing a lottery with a complete trajectory $\tau$, we can first discuss $\mathbb E[u(\tau)]$. Expressing this further as the expected sum of discounted rewards requires additional structure, such as temporal additivity. The expected utility theorem does not, by itself, derive the discounted-return form used in RL.

### 2.2 Expectation, linearity, and cumulative return

For a discrete variable and a variable with a density, respectively,

$$
\mathbb E[X]=\sum_x x\,\mathbb P(X=x),
\qquad
\mathbb E[X]=\int_{-\infty}^{\infty}x f_X(x)\,dx.
$$

Expectation is a population quantity weighted by the distribution. Its further interpretation as a long-run average over repeated trials requires the conditions of a law of large numbers.

In the slides' example, the reward is 10 with probability 0.3 and $-2$ with probability 0.7, so

$$
\mathbb E[R]=0.3\times10+0.7\times(-2)=1.6.
$$

If $X,Y$ are integrable and $a,b$ are constants, expectation is linear:

$$
\mathbb E[aX+bY]=a\mathbb E[X]+b\mathbb E[Y].
$$

**Independence is not required here.** For example, a finite-horizon discounted return satisfies

$$
\mathbb E\!\left[\sum_{t=0}^{T-1}\gamma^tR_{t+1}\right]
=\sum_{t=0}^{T-1}\gamma^t\mathbb E[R_{t+1}].
$$

For variables with finite second moments, variance and covariance are defined, respectively, by

$$
\operatorname{Var}(X)=\mathbb E[(X-\mathbb E[X])^2]
=\mathbb E[X^2]-(\mathbb E[X])^2,
$$

$$
\operatorname{Cov}(X,Y)=\mathbb E[(X-\mathbb E[X])(Y-\mathbb E[Y])]
=\mathbb E[XY]-\mathbb E[X]\mathbb E[Y].
$$

Expanding a variance introduces a covariance term:

$$
\operatorname{Var}(X+Y)=\operatorname{Var}(X)+\operatorname{Var}(Y)
+2\operatorname{Cov}(X,Y).
$$

Uncorrelatedness is enough to make the last term zero. Independence is a stronger sufficient condition. The linearity of expectation cannot be transferred to variance without conditions.

For an infinite horizon, we must also check whether the infinite sum and expectation can be interchanged. A common sufficient condition is uniformly bounded rewards and $0\le\gamma<1$. For example, if $|R_t|\le R_{\max}$, the absolute value of the discounted return is at most $R_{\max}/(1-\gamma)$.

### 2.3 Conditional expectation given an event

If an event $A$ satisfies $\mathbb P(A)>0$, conditional expectation averages again within the outcomes for which $A$ occurs:

$$
\mathbb E[Y\mid A]=\sum_y y\,\mathbb P(Y=y\mid A)
$$

Or, when the corresponding conditional density exists,

$$
\mathbb E[Y\mid A]=\int_{-\infty}^{\infty}y f_{Y\mid A}(y)\,dy.
$$

Bayes' rule expresses the conditional density as

$$
f_{Y\mid A}(y)=\frac{\mathbb P(A\mid Y=y)f_Y(y)}{\mathbb P(A)}.
$$

Intuitively, run the experiment many times, keep only the outcomes satisfying $A$, and average their values of $Y$. When the repeated trials satisfy the appropriate law of large numbers, this average approaches the conditional expectation.

If $A_1,\ldots,A_m$ partition the sample space into events of positive probability, the law of total expectation is

$$
\mathbb E[Y]=\sum_{i=1}^{m}\mathbb E[Y\mid A_i]\mathbb P(A_i).
$$

In the slides' weather example, the probability of sunshine is 0.6 and the probability of rain is 0.4. The conditional expected reward is 5 on sunny days and 1 on rainy days. Thus

$$
\mathbb E[R]=0.6\times5+0.4\times1=3.4.
$$

We do not simply average 5 and 1 to get 3, because the two weather conditions occur with different frequencies.

### 2.4 Given a random variable, conditional expectation is itself a random variable

First fix an observed value $x$ and define

$$
m(x)=\mathbb E[Y\mid X=x].
$$

Then substitute the random variable $X$:

$$
\mathbb E[Y\mid X]=m(X).
$$

These two expressions must not be confused. With $x$ fixed, $m(x)$ is a number. Before observing $X$, $m(X)$ is a random variable. Thus $\mathbb E[\mathbb E[Y\mid X]]$ and $\operatorname{Var}(\mathbb E[Y\mid X])$ are meaningful operations. Conditional expectation only needs to be determined almost everywhere. There is no need to impose a unique answer artificially at observations of probability zero.

Continuing the weather example, $m(W)$ equals 5 with probability 0.6 and 1 with probability 0.4. Its expectation is 3.4. Conditional expectation does not eliminate all uncertainty at once. Instead, it compresses the prediction of $Y$ into a function of the known variable $X$.

### 2.5 Properties of conditional expectation and the tower property

All the equalities below are understood to hold almost everywhere.

**Discarding independent information.** If $Y$ is integrable and $X,Y$ are independent, then

$$
\mathbb E[Y\mid X]=\mathbb E[Y].
$$

The converse is generally false: a constant conditional mean does not rule out a conditional variance that changes with $X$.

**Taking out what is known.** For a measurable function $h$, provided the relevant products are integrable,

$$
\mathbb E[h(X)Y\mid X]=h(X)\mathbb E[Y\mid X].
$$

Once $X$ is given, $h(X)$ is known and does not need to be averaged further. In particular, $\mathbb E[h(X)\mid X]=h(X)$.

**Linearity.** If $Y_1,Y_2$ are integrable, then

$$
\mathbb E[aY_1+bY_2\mid X]
=a\mathbb E[Y_1\mid X]+b\mathbb E[Y_2\mid X].
$$

**Total or iterated expectation, also known as Adam's law.** If $Y$ is integrable,

$$
\mathbb E\big[\mathbb E[Y\mid X]\big]=\mathbb E[Y].
$$

The inner expectation averages over $Y\mid X=x$. The outer one averages over the marginal distribution of $X$. In the continuous case, this is

$$
\begin{aligned}
\mathbb E\big[\mathbb E[Y\mid X]\big]
&=\int\left[\int y f_{Y\mid X}(y\mid x)\,dy\right]f_X(x)\,dx\\
&=\iint y f_{X,Y}(x,y)\,dy\,dx
=\int y f_Y(y)\,dy.
\end{aligned}
$$

The slides illustrate this with class grades: first compute the mean grade in each class, then weight those class means by their shares of the total student population to obtain the overall mean. When class sizes differ, a simple average of the class means is not enough.

**The tower property while retaining part of the conditioning information.** If $Y$ is integrable, then

$$
\mathbb E\big[\mathbb E[Y\mid X,Z]\mid Z\big]=\mathbb E[Y\mid Z].
$$

Similarly, for integrable $X$,

$$
\mathbb E\big[\mathbb E[X\mid Z,Y]\mid Y\big]=\mathbb E[X\mid Y].
$$

The key is that the inner and outer information sets are nested: the outer expectation retains only part of the information available to the inner one. We cannot arbitrarily "remove a layer of expectation" between two conditioning sets when neither contains the other.

### 2.6 Conditional variance and total variance

If $\mathbb E[Y^2]<\infty$, conditional variance is defined by

$$
\operatorname{Var}(Y\mid X)
=\mathbb E\big[(Y-\mathbb E[Y\mid X])^2\mid X\big]
=\mathbb E[Y^2\mid X]-\big(\mathbb E[Y\mid X]\big)^2.
$$

It, too, is usually a random function of $X$: groups may differ not only in their means, but also in their within-group variability.

The law of total variance, also known as Eve's law, is

$$
\operatorname{Var}(Y)
=\mathbb E[\operatorname{Var}(Y\mid X)]
+\operatorname{Var}(\mathbb E[Y\mid X]).
$$

The first term is the average within-group variability. The second is the variability of the group means. The order $E\!V+V\!E$ provides a mnemonic for the positions of the two terms.

In the weather example, let the reward variances under the two weather conditions be $\sigma_{\mathrm{s}}^2,\sigma_{\mathrm{r}}^2$. The variance of the conditional mean itself is

$$
0.6(5-3.4)^2+0.4(1-3.4)^2=3.84,
$$

The overall reward variance is therefore $0.6\sigma_{\mathrm{s}}^2+0.4\sigma_{\mathrm{r}}^2+3.84$. Knowing only the two group means does not determine the overall variance. The missing ingredient is precisely the within-group uncertainty.

### 2.7 Conditional expectation in RL: value and one-step decomposition

Write the discounted return as

$$
G_t=\sum_{k=0}^{\infty}\gamma^kR_{t+k+1}
=R_{t+1}+\gamma G_{t+1}.
$$

With the environment model and policy $\pi$ fixed, the state value is

$$
V^\pi(s)=\mathbb E_\pi[G_t\mid S_t=s].
$$

The future return $G_t$ is random. Once the policy, model, and state $s$ are fixed, $V^\pi(s)$ is a deterministic conditional average, not a value that any particular trajectory is guaranteed to deliver. A data-based estimate $\widehat V(s)$, by contrast, also varies with the sample.

For a time-homogeneous MDP, a stationary Markov policy, and suitable integrability conditions, the tower property and Markov property give

$$
V^\pi(s)
=\mathbb E_\pi[R_{t+1}+\gamma V^\pi(S_{t+1})\mid S_t=s].
$$

If we also fix the current action, the one-step expression in the slides is

$$
\mathbb E[R_{t+1}+\gamma V(S_{t+1})\mid S_t=s,A_t=a].
$$

This averages over possible rewards and next states with the current state and action held fixed. It becomes the corresponding Bellman relation only after the appropriate value function, policy, and environment assumptions are specified. Substituting an arbitrary $V$ does not make it the true value.

<div class="recall-block">

**Recall | Answer first, then check**

1. In the weather example, what kinds of objects are $\mathbb E[R\mid W]$ and $\mathbb E[R\mid W=\mathrm{sunny}]$, respectively?
2. If overall reward variability is large, must rewards also be highly unstable within each weather condition?

<details class="recall-answer">
<summary>Check the answers</summary>
<div class="disclosure-body">

The former is a random variable taking the values 5 or 1. The latter is the number 5. Overall variability may also arise mainly from the difference between the two group means, represented by the second term in the law of total variance.

</div>
</details>
</div>

## 3. LLSE, MMSE, and projection: why conditional expectation is the best squared-error prediction

This chapter corresponds to pages 41–53. We observe $X$ and use a function $g(X)$ to predict $Y$. The general prediction problem is

$$
\min_g\mathbb E[c(Y,g(X))],
$$

where $c$ is the cost of an incorrect prediction. Different losses define different meanings of "best." This chapter focuses on squared loss and assumes that $X,Y$ have the required finite second moments.

### 3.1 LLSE: restricting predictions to affine functions

The slides call $a+bX$ a linear prediction. Because an intercept is allowed, it is, strictly speaking, an affine function of $X$. All such random variables form $\operatorname{span}\{1,X\}$.

Linear least-squares estimation (LLSE) solves

$$
\min_{a,b}\mathbb E[(Y-a-bX)^2].
$$

When $\operatorname{Var}(X)>0$, the answer is

$$
L[Y\mid X]
=\mathbb E[Y]+\frac{\operatorname{Cov}(X,Y)}{\operatorname{Var}(X)}(X-\mathbb E[X]).
$$

It passes through the mean point $(\mathbb E[X],\mathbb E[Y])$, with a slope equal to the covariance divided by the input variance. If $X$ is constant almost everywhere, so that $\operatorname{Var}(X)=0$, we cannot divide by zero. There is then no input variation to exploit, and the best prediction is the constant $\mathbb E[Y]$.

For a short derivation, let the residual be $e=Y-a-bX$. Optimality gives the normal equations

$$
\mathbb E[e]=0,\qquad \mathbb E[eX]=0.
$$

Eliminate the intercept using the first equation, then obtain the slope above from the second. The minimum error is

$$
\operatorname{Var}(Y)-\frac{\operatorname{Cov}(X,Y)^2}{\operatorname{Var}(X)}.
$$

LLSE guarantees optimality only within the class of affine predictions. It does not establish that the true conditional mean is also a straight line.

### 3.2 MMSE: allowing all square-integrable functions of $X$

If we allow any measurable, square-integrable $g(X)$, the optimal prediction function for minimum mean-square error (MMSE) prediction is

$$
g^*(X)=\mathbb E[Y\mid X].
$$

Sometimes MMSE refers to the optimal predictor, and sometimes to the minimum error it achieves. Distinguish these meanings when reading. The latter is

$$
\min_g\mathbb E[(Y-g(X))^2]
=\mathbb E[\operatorname{Var}(Y\mid X)].
$$

**The key proof.** Write $m(X)=\mathbb E[Y\mid X]$ and decompose the error of any candidate as

$$
Y-g(X)=(Y-m(X))+(m(X)-g(X)).
$$

Given $X$, the first term has mean 0 and the second is known, so the cross term has overall expectation 0. Hence

$$
\mathbb E[(Y-g(X))^2]
=\mathbb E[(Y-m(X))^2]+\mathbb E[(m(X)-g(X))^2].
$$

The second term is nonnegative, so the conditional mean is optimal. The same minimum is achieved only when $g(X)=m(X)$ almost everywhere. This establishes optimality for population risk. It does not guarantee that finite-sample learning, a restricted neural network, or numerical optimization will find it.

Under absolute-error loss, the optimum is generally a conditional median instead. Thus, the statement that "the conditional mean is the best prediction" must specify both squared loss and the information available to the predictor.

### 3.3 Geometry in Hilbert space: inner products, distance, orthogonality, and nested projections

View random variables with finite second moments as vectors in $L^2(\Omega,\mathcal F,\mathbb P)$, identifying variables that are equal almost everywhere as the same element. The inner product, norm, and distance are, respectively,

$$
\langle U,V\rangle=\mathbb E[UV],\qquad
\|U\|_2=\sqrt{\mathbb E[U^2]},\qquad
\|U-V\|_2=\sqrt{\mathbb E[(U-V)^2]}.
$$

Minimizing mean-square error means finding the prediction vector closest to the target random variable.

- **LLSE** projects $Y$ onto $\operatorname{span}\{1,X\}$.
- **MMSE** projects $Y$ onto the closed subspace $\mathcal H_X=L^2(\sigma(X))$, the square-integrable random variables determined solely by $X$.
- **Ordinary expectation** projects $Y$ onto the subspace of constants, yielding the constant $\mathbb E[Y]$.

Allowing a nonlinear conditional mean therefore does not abandon geometry: it simply uses a much larger subspace than the class of straight-line predictions.

Orthogonality means $\mathbb E[UV]=0$. Uncorrelatedness means $\operatorname{Cov}(U,V)=0$. The two are not interchangeable without conditions. If at least one variable has mean 0, covariance equals the inner product. For two centered variables, uncorrelatedness can always be understood as orthogonality. If the norms are nonzero, we can also use

$$
\cos\theta=\frac{\mathbb E[UV]}{\sqrt{\mathbb E[U^2]\mathbb E[V^2]}}
$$

to describe the angle in $L^2$. The correlation coefficient corresponds to this angle between the centered variables.

Page 53 of the slides also explains the tower property through nested projections: the constant subspace is contained in $\mathcal H_X$, so projecting first onto $\mathcal H_X$ and then onto the constants is the same as projecting directly onto the constants. More generally, $\sigma(Z)\subseteq\sigma(X,Z)$ yields the tower property that retains $Z$. The law of total variance follows from applying the Pythagorean relation after splitting centered $Y$ into a "between-group mean" component and a "within-group residual."

### 3.4 The orthogonality property and its converse

For any square-integrable $h(X)$, the conditional-mean residual satisfies

$$
\mathbb E[(Y-\mathbb E[Y\mid X])h(X)]=0.
$$

The handwritten proof relies on "taking out what is known" and then applying the tower property:

$$
\begin{aligned}
\mathbb E[(Y-m(X))h(X)]
&=\mathbb E\!\left[h(X)\mathbb E[Y-m(X)\mid X]\right]\\
&=0.
\end{aligned}
$$

The residual is therefore orthogonal to every square-integrable feature based on $X$, not just to $X$ itself. Conversely, if a square-integrable $g(X)$ satisfies $\mathbb E[(Y-g(X))h(X)]=0$ for all such $h$, then $g(X)=\mathbb E[Y\mid X]$ almost everywhere. Both residuals are orthogonal. Choosing $h(X)=g(X)-m(X)$ shows that the expected squared difference between the two predictions is zero.

This also explains the difference between LLSE and MMSE: the LLSE residual only needs to be orthogonal to constants and $X$, whereas the MMSE residual must be orthogonal to the whole of $\mathcal H_X$. **Orthogonality still does not imply independence.**

### 3.5 For jointly Gaussian variables, LLSE equals MMSE

If $(X,Y)$ are **jointly Gaussian** and $\operatorname{Var}(X)>0$, then

$$
\mathbb E[Y\mid X]
=L[Y\mid X]
=\mathbb E[Y]+\frac{\operatorname{Cov}(X,Y)}{\operatorname{Var}(X)}(X-\mathbb E[X]).
$$

A short route to this result is to let $e=Y-L[Y\mid X]$. It is uncorrelated with $X$, and $(e,X)$ remain jointly Gaussian. For jointly Gaussian variables, uncorrelatedness further implies independence. Thus $\mathbb E[e\mid X]=\mathbb E[e]=0$, and the conditional mean is this affine line.

"Jointly Gaussian" cannot be weakened to "the marginal distributions of $X$ and $Y$ are each Gaussian". The latter does not guarantee the required joint structure.

For general distributions, the conditional mean can be highly nonlinear. As an additional counterexample, take $X\sim\operatorname{Unif}[-1,1]$ and $Y=X^2$. Symmetry gives $\operatorname{Cov}(X,Y)=0$, so the LLSE is the constant $\mathbb E[X^2]=1/3$. The MMSE predictor, however, is $X^2$ and has error 0. An input can provide predictive information even when it provides no linear correlation.

The linear regression, polynomial, spline, and neural network models listed on page 52 can be understood as choices of different function classes for approximating conditional relationships. For a binary label, the conditional mean is the success probability. Logistic regression gives it a sigmoid form and is usually trained using likelihood or cross-entropy. This does not make all these algorithms the same squared-loss optimization problem, nor does it make a population optimum equivalent to an empirically fitted result.

<div class="recall-block">

**Recall | Answer first, then check**

1. If the LLSE slope is 0, can we conclude that $X$ does not help predict $Y$?
2. To check whether a candidate $g(X)$ is the full conditional mean, is it enough to check that its residual is uncorrelated with $X$?

<details class="recall-answer">
<summary>Check the answers</summary>
<div class="disclosure-body">

The symmetric example $Y=X^2$ refutes the first conclusion. For the second question, we must check orthogonality against all square-integrable functions of $X$, or use an equivalent characterization of the conditional mean, rather than checking just one linear direction.

</div>
</details>
</div>

## 4. Monte Carlo, concentration inequalities, and finite-sample confidence

This chapter corresponds to pages 55–87. It retains all the main inequalities as well as analytical tools such as Cauchy–Schwarz, Jensen, entropy, and KL. Apart from the short arguments explicitly included, I do not give the full proofs of the concentration inequalities. **Omitting a proof does not mean omitting a theorem's assumptions**. In this chapter's tail bounds, $\ln$ denotes the natural logarithm. Entropy and KL follow the slides in using $\log_2$, with units of bits.

### 4.1 Monte Carlo: replacing an expectation with an empirical average

Let $X_1,\ldots,X_n$ be independent and identically distributed, with $\mu=\mathbb E[X_i]$ existing. The sample mean is

$$
\widehat\mu_n=\frac1n\sum_{i=1}^{n}X_i.
$$

If the samples are integrable, then $\mathbb E[\widehat\mu_n]=\mu$, so the estimator is unbiased. If they also have finite variance $\sigma^2$, then

$$
\operatorname{Var}(\widehat\mu_n)=\frac{\sigma^2}{n},\qquad
\operatorname{SE}(\widehat\mu_n)=\frac{\sigma}{\sqrt n}.
$$

Unbiasedness follows from the linearity of expectation and does not require independence. Reducing the variance to $1/n$ of the original uses zero covariances between samples. Unbiasedness means that the estimator is correct on average over repeated sampling, not that every estimate is close to the truth.

In RL, collect returns $G^{(1)},\ldots,G^{(N(s))}$ for state $s$. The Monte Carlo value estimate is

$$
\widehat V(s)=\frac{1}{N(s)}\sum_{i=1}^{N(s)}G^{(i)},\qquad N(s)>0.
$$

The five returns in the slides are $4,2,5,-1,0$, so $\widehat V(s)=2$. Whether we can trust this 2 depends on more than the mean: we must also consider the range of returns, their variability, and how they were sampled. Computing the unbiased sample variance gives $26/4=6.5$, but this does not mean we know the population variance. Still less can we treat the minimum and maximum of five samples as known bounds on the true return distribution.

Ordinary episodic MC waits for the complete return before updating. Infinite-horizon tasks often require truncation or other treatment, and truncation introduces additional error. Even with many state visits, overlapping returns within the same episode need not be independent. Policy changes during training may also change the return distribution. Neither the iid variance formula above nor the Hoeffding guarantee below applies automatically just because we have written down an average.

### 4.2 What the LLN, CLT, and concentration inequalities each answer

**Law of large numbers.** If $X_i$ are iid and $\mathbb E|X_i|<\infty$, the sample mean converges almost surely:

$$
\widehat\mu_n\xrightarrow{\mathrm{a.s.}}\mu.
$$

This also implies convergence in probability: for every fixed $\varepsilon>0$, $\mathbb P(|\widehat\mu_n-\mu|>\varepsilon)\to0$. Finite variance is a stronger sufficient condition that makes Chebyshev convenient to use. It is not the only condition under which the iid law of large numbers above applies.

**Central limit theorem.** If $X_i$ are iid with mean $\mu$ and $0<\sigma^2=\operatorname{Var}(X_i)<\infty$, then

$$
\frac{\sqrt n(\widehat\mu_n-\mu)}{\sigma}
\xrightarrow{\mathrm d}\mathcal N(0,1).
$$

This describes the asymptotic shape of the standardized error. For large samples, we often use the approximation $\widehat\mu_n\sim\mathcal N(\mu,\sigma^2/n)$. It does not mean the distribution is exactly normal for every finite $n$, nor does it automatically provide a nonasymptotic error guarantee at an arbitrary confidence level.

**Concentration inequalities** directly study finite-sample tail probabilities, for example,

$$
\mathbb P(|\widehat\mu_n-\mu|\ge\varepsilon)\le\delta.
$$

Here $n$ is the sample size, $\varepsilon$ is the error tolerance, and $\delta$ is the failure probability. The LLN gives the limiting behavior, the CLT gives an asymptotic distribution, and concentration bounds give finite-sample control under specific conditions. These are not interchangeable names.

### 4.3 Cauchy–Schwarz: controlling inner products and correlation

If $\mathbb E[X^2],\mathbb E[Y^2]<\infty$, then

$$
|\mathbb E[XY]|\le\sqrt{\mathbb E[X^2]\mathbb E[Y^2]}.
$$

Equality corresponds to $X,Y$ being linearly dependent in $L^2$, including the degenerate case where one is zero almost everywhere. Applying this to centered variables gives

$$
|\operatorname{Cov}(X,Y)|\le\sqrt{\operatorname{Var}(X)\operatorname{Var}(Y)}.
$$

When both variances are positive, this explains why the correlation coefficient lies in $[-1,1]$. It is also a basic tool ensuring that the projection angle in the previous chapter is defined and that the error formula cannot become negative. Independence of $X,Y$ is not required.

### 4.4 Jensen: transforming before averaging versus averaging before transforming

The two-point definition of a convex function is: on a convex domain, for $\lambda\in[0,1]$,

$$
f(\lambda x_1+(1-\lambda)x_2)
\le\lambda f(x_1)+(1-\lambda)f(x_2).
$$

Geometrically, the graph lies below the chord joining two points. For a concave function, the inequality is reversed. If $X$ is integrable, takes values in the relevant interval, and the relevant expectations are defined, Jensen gives

$$
f(\mathbb E[X])\le\mathbb E[f(X)]\quad\text{(convex function)},
$$

$$
f(\mathbb E[X])\ge\mathbb E[f(X)]\quad\text{(concave function)}.
$$

If the function is strictly convex or strictly concave and the relevant expectations are finite, equality holds only when $X$ is constant almost everywhere. In the non-strict case, the function may be affine on the relevant range of values. A particular caution: merely writing $f(X)=a+bX$ almost everywhere is not, without further conditions, a sufficient criterion for equality. For a two-point distribution, we can always draw a line through the two function values, even though the function may curve strictly between those points.

The handwritten notes on page 66 give three examples:

1. $f(x)=x^2$ is convex on the real line. If the second moment is finite,

$$
\mathbb E[X^2]\ge(\mathbb E[X])^2,
$$

This is also the nonnegativity of variance.

2. $f(x)=1/x$ is convex on $(0,\infty)$. If $X>0$ almost everywhere and the relevant expectations are finite,

$$
\mathbb E[1/X]\ge\frac{1}{\mathbb E[X]}.
$$

3. $f(x)=\log x$ is concave on $(0,\infty)$. If $X>0$, and $\mathbb E[X]$ and the required logarithmic expectation are finite,

$$
\mathbb E[\log X]\le\log\mathbb E[X].
$$

The positive domains in the last two examples must not be overlooked. They show that nonlinear transformations generally cannot be moved freely through an expectation.

### 4.5 Entropy and maximum entropy: why the uniform distribution is most uncertain

For a discrete distribution $p_1,\ldots,p_n$ over $n$ possible values, entropy is defined by

$$
H(X)=-\sum_{j=1}^{n}p_j\log_2p_j
=\sum_{j:p_j>0}p_j\log_2\frac1{p_j}.
$$

The convention is $0\log_2 0=0$. Entropy is nonnegative and equals 0 when the variable is deterministic. The slides ask us to prove that, over the $n$ allowed values,

$$
H(X)\le\log_2 n,
$$

with the maximum attained at $p_j=1/n$.

**The handwritten proof, organized.** Let $J$ select an index according to distribution $p$, and construct the random variable $Z=1/p_J$. If there are $m$ values with positive probability, then $\mathbb E[Z]=m$, while $H(X)=\mathbb E[\log_2Z]$. By the concavity of the logarithm,

$$
H(X)\le\log_2\mathbb E[Z]=\log_2m\le\log_2n.
$$

For the uniform distribution over all $n$ values, $Z=n$ is constant, and $\log_2n$ is indeed attained. Strict concavity of the logarithm shows that this maximizing distribution is unique. If only the actual $m$ positive-probability values are allowed, the corresponding maximum entropy is $\log_2m$.

This characterizes discrete entropy for a given finite set of values. It does not say that a uniform distribution maximizes entropy on every space. Continuous spaces and additional constraints require separate analysis.

### 4.6 KL divergence: the extra cost of describing data with the wrong distribution

For two probability vectors $p,r$ on the same finite set, cross-entropy is defined by

$$
H(p,r)=-\sum_{j:p_j>0}p_j\log_2r_j.
$$

When the true distribution is $p$, describing outcomes using the ideal code lengths $-\log_2r_j$ assigned by $r$ has average cost $H(p,r)$. Using the true distribution itself gives $H(p)$. The difference is $D_{\mathrm{KL}}(p\|r)=H(p,r)-H(p)$, whose equivalent standard form is

$$
D_{\mathrm{KL}}(p\|r)
=\sum_{j:p_j>0}p_j\log_2\frac{p_j}{r_j}.
$$

Terms with $p_j=0$ contribute 0 by convention. If $p_j>0$ but $r_j=0$ anywhere, the divergence is $+\infty$. For a finite value, $r$ must cover the positive-probability support of $p$. KL satisfies

$$
D_{\mathrm{KL}}(p\|r)\ge0,
$$

with equality if and only if $p=r$. It is generally asymmetric and does not satisfy all the axioms of a distance, so a divergence cannot simply be treated as an ordinary geometric distance.

**Answer to the nonnegativity exercise.** On indices where $p_j>0$, set $Z=r_J/p_J$, with $J\sim p$. If the divergence is finite, then

$$
\begin{aligned}
D_{\mathrm{KL}}(p\|r)
&=-\mathbb E_p[\log_2 Z]\\
&\ge-\log_2\mathbb E_p[Z]
=-\log_2\!\left(\sum_{j:p_j>0}r_j\right)\ge0.
\end{aligned}
$$

If every $p_j$ is positive, the sum in parentheses is 1. If some probabilities are zero, the sum is only guaranteed to be at most 1. Equality additionally requires the ratio to be constant on the positive support and $r$ to place no mass outside the support of $p$. Together these conditions give $r=p$.

### 4.7 Markov and Chebyshev: tail bounds from first and second moments

**Markov's inequality.** If $Z\ge0$ almost everywhere and $\mathbb E[Z]<\infty$, then for any $a>0$,

$$
\mathbb P(Z\ge a)\le\frac{\mathbb E[Z]}a.
$$

For a general integrable random variable $X$, set $Z=|X|$ to obtain the form in the slides:

$$
\mathbb P(|X|\ge a)\le\frac{\mathbb E|X|}{a}.
$$

The handwritten proof simply uses $\mathbf1_{\{Z\ge a\}}\le Z/a$ and takes expectations on both sides. For an $X$ that can be negative, we cannot arbitrarily replace the right-hand side with $\mathbb E[X]/a$.

**Chebyshev's inequality.** If $X$ has mean $\mu$ and finite variance $\sigma^2$, then for any $a>0$,

$$
\mathbb P(|X-\mu|\ge a)\le\frac{\sigma^2}{a^2}.
$$

This follows immediately by applying Markov to the nonnegative quantity $(X-\mu)^2$. It requires neither normality nor boundedness. For the sample mean of iid variables with finite variance, we further have

$$
\mathbb P(|\widehat\mu_n-\mu|\ge\varepsilon)
\le\frac{\sigma^2}{n\varepsilon^2},\qquad\varepsilon>0.
$$

For fixed $\varepsilon$, the right-hand side tends to 0. This is how the handwritten notes derive the weak law of large numbers from Chebyshev. It provides a finite-sample bound, but may be loose when the desired failure probability is very small.

### 4.8 Chernoff: controlling tail probabilities through exponential moments

Define the moment-generating function $M_X(\lambda)=\mathbb E[e^{\lambda X}]$, using it within the parameter range where it is finite. For any threshold $c\in\mathbb R$ and $\lambda>0$,

$$
\mathbb P(X\ge c)
\le e^{-\lambda c}M_X(\lambda).
$$

The reason is that the exponential transformation preserves order: $X\ge c$ is equivalent to $e^{\lambda X}\ge e^{\lambda c}$. We then apply Markov to this nonnegative quantity. Choosing the most favorable parameter gives

$$
\mathbb P(X\ge c)\le\inf_{\lambda>0}e^{-\lambda c}M_X(\lambda).
$$

For the lower tail, use $\lambda<0$:

$$
\mathbb P(X\le c)\le\inf_{\lambda<0}e^{-\lambda c}M_X(\lambda).
$$

A negative parameter is used for the lower tail so that $X\le c$ implies $\lambda X\ge\lambda c$. Exponential moments need not be finite. If the moment-generating function diverges throughout the chosen direction, this method gives no useful finite bound. Chernoff relies on control of exponential moments, not on the data being normally distributed.

### 4.9 Hoeffding's lemma, a note on sub-Gaussian variables, and Taylor's theorem

**Hoeffding's lemma.** If $\mathbb E[X]=0$ and $a\le X\le b$ almost everywhere, with constants $a<b$, then

$$
\mathbb E[e^{\lambda X}]
\le\exp\!\left(\frac{\lambda^2(b-a)^2}{8}\right),\qquad\lambda\in\mathbb R.
$$

The slides state the positive-parameter version. Applying the same result to $-X$ gives the negative-parameter version. If the original variable has mean $\mu$, first center it as $Y=X-\mu$. The interval changes from $[a,b]$ to $[a-\mu,b-\mu]$, but its width remains $b-a$.

The handwritten notes introduce "sub-Gaussian" here. One standard definition is that a mean-zero variable satisfying, for some $v^2$,

$$
\mathbb E[e^{\lambda X}]\le e^{\lambda^2v^2/2}\quad\text{for all }\lambda\in\mathbb R,
$$

has sub-Gaussian variance proxy $v^2$. Hoeffding's lemma shows that a centered bounded variable can use $v^2=(b-a)^2/4$. The proxy does not assert that the actual variance equals this number, or that the variable itself has a Gaussian distribution.

Page 77 also lists convexity and Taylor expansion as analytical tools. To avoid omitting conditions, here is a standard sufficient version: let $k\ge0$ be an integer. If $f$ has a continuous derivative of order $k+1$ on an interval containing $a,x$, then there is a $\xi$ between $a,x$ such that

$$
f(x)=\sum_{j=0}^{k}\frac{f^{(j)}(a)}{j!}(x-a)^j
+\frac{f^{(k+1)}(\xi)}{(k+1)!}(x-a)^{k+1}.
$$

Knowing only that derivatives of each order exist at the single point $a$ is not enough to guarantee this remainder formula over an interval. I retain the statement of this tool here without expanding the proof of Hoeffding's lemma.

### 4.10 Hoeffding's inequality: exponential concentration for independent, bounded samples

**A common-range, common-mean version.** Let $X_1,\ldots,X_n$ be independent, with $\mathbb E[X_i]=\mu$ and $a\le X_i\le b$ almost everywhere, where $a<b$ are fixed constants. For any $\varepsilon>0$,

$$
\mathbb P\!\left(\left|\frac1n\sum_{i=1}^{n}X_i-\mu\right|\ge\varepsilon\right)
\le2\exp\!\left(-\frac{2n\varepsilon^2}{(b-a)^2}\right).
$$

The samples need not be identically distributed. Independence, a common mean, and a common range suffice. The leading factor 2 can be removed for each of the one-sided upper- and lower-tail bounds.

**A general version with different means and ranges.** If the $X_i$ are independent and $a_i\le X_i\le b_i$, let $S_n=\sum_iX_i$ and $\mu_S=\mathbb E[S_n]$, and assume $\sum_i(b_i-a_i)^2>0$. Then, for $u>0$,

$$
\mathbb P(|S_n-\mu_S|\ge u)
\le2\exp\!\left(-\frac{2u^2}{\sum_{i=1}^{n}(b_i-a_i)^2}\right).
$$

If every range has width zero, the sum itself is deterministic, so there is no need to use an expression with a zero denominator. The common-range version can also be centered at $n^{-1}\sum_i\mathbb E[X_i]$. There is no need to force all the means to be equal.

**The proof route, rather than a full proof.** The handwritten notes first center the variables as $Y_i=X_i-\mu$. Independence gives

$$
\mathbb E\!\left[e^{\lambda\sum_iY_i}\right]
=\prod_i\mathbb E[e^{\lambda Y_i}].
$$

Apply Hoeffding's lemma to each factor, substitute the resulting exponential-moment bound into Chernoff, optimize the parameter, and combine the upper and lower tails to obtain the result. The lemma itself and the complete parameter optimization are not proved here. Without independence, this product factorization cannot be used as written. Boundedness alone is insufficient.

### 4.11 Solving tail bounds for a confidence radius and sample size

For independent samples with mean $\mu$ and range $[a,b]$, take $\delta\in(0,1)$ and define

$$
r_n(\delta)=(b-a)\sqrt{\frac{\ln(2/\delta)}{2n}}.
$$

Hoeffding gives a coverage guarantee of at least $1-\delta$:

$$
\mu\in[\widehat\mu_n-r_n(\delta),\widehat\mu_n+r_n(\delta)].
$$

If the mean already lies in $[a,b]$, the interval may also be intersected with $[a,b]$. At a fixed confidence level, the radius shrinks as $1/\sqrt n$, so halving the error scale typically requires four times as many samples. Increasing the confidence level widens the radius through the factor $\sqrt{\ln(2/\delta)}$.

Conversely, to keep the error within a given $\varepsilon>0$ and the failure probability at most $\delta$, a sufficient condition is

$$
n\ge\frac{(b-a)^2\ln(2/\delta)}{2\varepsilon^2}.
$$

The exercise on page 84 takes $[a,b]=[0,1]$, $\varepsilon=0.1$, and $\delta=0.05$, giving

$$
n\ge\frac{\ln40}{2(0.1)^2}\approx184.44,
$$

Rounding up yields 185. This is a conservative sufficient sample size. It does not say that 184 must fail, or that every estimate will be accurate once we have 185 samples.

Here 95% confidence describes the coverage of the sampling procedure: if we repeatedly sample and construct intervals by the same rule, at least 95% of those intervals cover the fixed true mean. After observing a particular interval, we should not reinterpret this, without an additional model, as "the parameter has 95% posterior probability of lying here." Bayesian posterior probability is a different statement.

The range of returns must be checked separately. If each reward satisfies $R_t\in[0,1]$ and $0\le\gamma<1$, then the infinite discounted return satisfies $G_t\in[0,1/(1-\gamma)]$. At $\gamma=0.9$, the worst-case range justified by these assumptions is $[0,10]$. If we estimate the mean of independent returns, the radius is multiplied by 10 at the same $n$, and the sufficient sample size for maintaining an error of 0.1 increases by approximately a factor of 100. The exact rounded-up value is 18445, not the same 185 as before. For a finite horizon of $H$ steps, we can instead use the corresponding known return range.

### 4.12 A preview of UCB: turning uncertainty into an exploration bonus

In the classical stochastic multi-armed bandit model, suppose each arm has rewards in $[0,1]$, with repeated rewards from that arm drawn from a fixed iid sequence. Let $N_t(a)$ be the number of times the action has been tried before decision $t$, and let $\widehat\mu_t(a)$ be its empirical mean. The upper-confidence-bound selection rule previewed in the slides is

$$
A_t\in\operatorname*{arg\,max}_a
\left[\widehat\mu_t(a)+\sqrt{\frac{2\ln t}{N_t(a)}}\right].
$$

Before using this expression, we must handle $N_t(a)=0$, for example by trying each arm once first, or assigning an upper bound of $+\infty$ to an untried action. The term before the plus sign is the reward observed so far. The term after it is a bonus for what is still insufficiently understood. Less-tried actions receive a larger optimistic bonus.

This radius has the same form as Hoeffding's. In a fixed-sample-size calculation, choosing a failure probability that decreases appropriately with $t$ produces $\sqrt{\ln t/N}$. In the algorithm, however, $N_t(a)$ is a random quantity generated by adaptive decisions. A guarantee covering all actions and all times requires additional analysis of joint events or sequential methods. It does not follow in one line from a confidence interval at a fixed $n$. This lecture only previews how concentration can drive exploration. It neither proves a regret bound for UCB nor extends the formula unconditionally to arbitrary correlated trajectories.

The full chain in this chapter is: unknown expectation $\mu$ → observable sample mean $\widehat\mu_n$ → error $|\widehat\mu_n-\mu|$ → tail probability that the error exceeds a threshold → finite-sample confidence → using confidence to organize exploration. The Markov dynamics chapters will ask the next question: when samples come from a temporally dependent trajectory, which independent-sampling assumptions still hold?

<div class="recall-block">

**Recall | Answer first, then check**

1. If we copy the outcome of a single fair coin toss one hundred times, is the mean still unbiased? Does its variance fall to one hundredth of the original?
2. Both the average one-step reward and the average cumulative return are written as sample means. Why can they not simply share the same "185 samples" guarantee?

<details class="recall-answer">
<summary>Check the answers</summary>
<div class="disclosure-body">

The mean of the copies is still equal to the outcome of that single toss. It can be unbiased, but its variance remains $1/4$. For the second question, we must recheck the known range of returns, independence, distributional stability, and the confidence requirements.

</div>
</details>
</div>

## 5. Markov Dynamics I: from random variables to stochastic processes

This chapter corresponds to logical pages 89–114 of Lecture 1. Throughout, distributions are represented as row vectors and $Q$ denotes the transition matrix. In $q_{ij}$, the first subscript identifies the departure state and the second identifies the arrival state.

### 5.1 A stochastic process has two dimensions: time and state space

A single random variable describes one uncertain outcome. A stochastic process describes a collection of random variables ordered in time and potentially dependent on one another. In general, we write

$$
\{X_t:t\in I\},\qquad X_t:\Omega\to\mathcal S.
$$

Here $I$ is the time index set, $\mathcal S$ is the state space, and all the $X_t$ are defined on a common probability space. For a fixed time $t$, $X_t$ is a random variable. For a fixed random outcome $\omega$, $t\mapsto X_t(\omega)$ is a sample path. A realized path must not be confused with its probability distribution at each time.

Whether time is discrete or continuous and whether the state space is discrete or continuous are two separate choices.

| Time | State space | Example from the lecture notes | How to read it |
|---|---|---|---|
| Discrete | Discrete | The board position after the $k$th dice roll in Monopoly, $\mathcal S=\{1,\ldots,40\}$ | Record the square number after each roll |
| Discrete | Continuous | An hourly PM2.5 reading. The notes use the interval $(0,2000)$ as an illustrative state space | Discrete sampling times do not prevent the readings from being continuous-valued |
| Continuous | Discrete | The number of emails received by time $t$, $\mathcal S=\{0,1,2,\ldots\}$ | The count can be queried at any time, but its cumulative value must be an integer |
| Continuous | Continuous | The position of two-dimensional Brownian motion, $\mathcal S=\mathbb R^2$ | Both time and position are continuous |

This table only classifies stochastic processes. It does not imply that every example automatically has the Markov property under every modeling choice. For instance, the full rules of Monopoly may require information such as whether the player is in jail to be included in the state. An email-counting process is a Poisson process only under additional distributional assumptions.

In reinforcement learning, $S_0,S_1,\ldots$, $A_0,A_1,\ldots$, and $R_1,R_2,\ldots$ are all stochastic processes. The difficulty with sequential data is not merely an extra column of timestamps: the environment and policy create dependence between samples. Modeling requires a compromise between two extremes. The assumption of independent and identically distributed samples is often too strong, while allowing completely unrestricted dependence makes computation difficult. Markov models retain a form of dependence that can be analyzed.

### 5.2 The Markov property and time homogeneity are different assumptions

For a discrete-time process with a finite state space, the Markov property is written as

$$
\Pr(X_{n+1}=j\mid X_n=i,X_{n-1}=i_{n-1},\ldots,X_0=i_0)
=
\Pr(X_{n+1}=j\mid X_n=i),
$$

This statement applies only to histories for which the corresponding conditioning events are meaningful. It says that once the present is given, the past provides no additional improvement in predicting the next step. This is conditional independence, not independence between adjacent times: the current state can still strongly affect the next state.

Thus, a “state” is not simply an arbitrary name for an observed variable. It must satisfy a sufficiency requirement. A single image may not reveal an object's velocity, whereas earlier images may. In that case, a single-frame observation need not be a Markov state. The appropriate response is to include the missing information in the state or maintain a belief about the hidden state.

**Time homogeneity** additionally requires that the transition law not change with absolute time:

$$
\Pr(X_{n+1}=j\mid X_n=i)=q_{ij},\qquad n=0,1,\ldots.
$$

A time-inhomogeneous Markov chain may satisfy “depends only on the current state” while using $q_{ij}^{[n]}$ that varies with $n$. For example, even given the same condition of “rain today,” the probability of rain tomorrow may vary with the season. The discussion of powers of a fixed matrix below assumes a homogeneous chain.

Classifying by time and state space, discrete time with discrete states gives a discrete-time Markov chain, and continuous time with discrete states gives a continuous-time Markov chain. A continuous state space can also be paired with either discrete or continuous time to give a Markov process. The calculations that follow in this lecture mainly concern finite-state, discrete-time, homogeneous Markov chains. These matrix formulas cannot be used unchanged as formulas for continuous-time generator matrices.

### 5.3 The transition matrix: each row is a conditional distribution for the next step

Define

$$
Q=(q_{ij})_{i,j=1}^{M},\qquad q_{ij}=\Pr(X_{n+1}=j\mid X_n=i).
$$

The entries must satisfy

$$
q_{ij}\ge 0,\qquad \sum_{j=1}^{M}q_{ij}=1.
$$

This is a row-stochastic matrix. Its columns are not required to sum to one. The four-state example in the notes is

$$
Q=
\begin{pmatrix}
0.1&0.3&0&0.6\\
0.4&0.2&0.1&0.3\\
0&0.8&0&0.2\\
0.2&0&0.2&0.6
\end{pmatrix}.
$$

The first row says that, starting from state 1, the next step stays in 1 with probability $0.1$, goes to 2 with probability $0.3$, cannot go directly to 3, and goes to 4 with probability $0.6$. A directed edge $i\to j$ in the graph corresponds exactly to $q_{ij}>0$. A self-loop corresponds to staying in place. The matrix and the graph are simply two representations of the same model.

The notes first present a rainy–sunny chain, with the states ordered as $(R,S)$:

$$
Q_{RS}=
\begin{pmatrix}
1/3&2/3\\
1/2&1/2
\end{pmatrix}.
$$

Thus, if today is rainy, tomorrow is sunny with probability $2/3$. If today is sunny, tomorrow is rainy with probability $1/2$. The weather chain used later to calculate the evolution of distributions has different numerical parameters. The two parameter sets should not be mixed.

Another example comes from Markov's study of transitions between vowels and consonants in Russian text. Against the background of 20,000 characters, approximately 8,638 vowels and 11,362 consonants, the notes give the empirical transition matrix

$$
Q\approx
\begin{pmatrix}
0.1278&0.8722\\
0.6632&0.3368
\end{pmatrix},
$$

The state order is “vowel, consonant.” This illustrates how counts of adjacent character types can be used to fit conditional transition probabilities. It does not establish that real natural language strictly follows a first-order homogeneous Markov model.

On an undirected triangle, moving to either of the other two vertices with equal probability at every step gives

$$
Q_{\triangle}=
\begin{pmatrix}
0&1/2&1/2\\
1/2&0&1/2\\
1/2&1/2&0
\end{pmatrix}.
$$

Here it is impossible to stay at the starting vertex in one step, but returning in two steps or three steps is possible. This example will also help distinguish “having no self-loops” from “being periodic”: the two are not equivalent.

### 5.4 Multi-step transitions and the Chapman–Kolmogorov equation

The $n$-step transition probability is

$$
q_{ij}^{(n)}=\Pr(X_n=j\mid X_0=i),\qquad Q^{(0)}=I.
$$

This means “being at $j$ at exactly step $n$,” not “having visited $j$ at least once within the first $n$ steps.” The latter is a hitting event and requires a separate calculation.

For a two-step transition, partition according to the intermediate state $k$:

$$
\begin{aligned}
q_{ij}^{(2)}
&=\sum_k\Pr(X_2=j,X_1=k\mid X_0=i)\\
&=\sum_k\Pr(X_2=j\mid X_1=k,X_0=i)
\Pr(X_1=k\mid X_0=i)\\
&=\sum_k q_{ik}q_{kj}=(Q^2)_{ij}.
\end{aligned}
$$

The move from the second line to the third uses the Markov property and time homogeneity. More generally, splitting the path at step $m$ gives the Chapman–Kolmogorov equation:

$$
q_{ij}^{(m+n)}=\sum_k q_{ik}^{(m)}q_{kj}^{(n)},
\qquad Q^{(m+n)}=Q^mQ^n.
$$

The full $n$-step transition matrix is therefore $Q^n$. With time-inhomogeneous transitions, one can still sum over intermediate states, but the matrices for the corresponding times must be multiplied. The result cannot simply be written as the $n$th power of a single fixed matrix.

If the initial distribution is the row vector $\mu_0$, the law of total probability gives

$$
\mu_{n+1}(j)=\sum_i\mu_n(i)q_{ij},
\qquad \mu_{n+1}=\mu_nQ,
\qquad \mu_n=\mu_0Q^n.
$$

For example, another weather chain, ordered as $(S,R)$, uses

$$
Q=\begin{pmatrix}0.8&0.2\\0.3&0.7\end{pmatrix},
\qquad \mu_0=(1,0).
$$

Starting from a sunny day, the distributions on the first and second days are

$$
\mu_1=(0.8,0.2),\qquad
\mu_2=(0.8,0.2)Q=(0.70,0.30).
$$

The probability $0.30$ of “rain on the second day” includes both intermediate routes, sunny-to-rainy and rainy-to-rainy. It is not obtained by repeatedly reusing the one-step probability $0.2$ of going from the initial sunny state to rain.

### 5.5 A three-state worked example: one-step probabilities, path probabilities, two-step distributions, and conditional expectation

The four consecutive questions on logical pages 111–114 of the notes use

$$
Q=
\begin{pmatrix}
1/4&1/2&1/4\\
1/3&0&2/3\\
1/2&0&1/2
\end{pmatrix}.
$$

**Question 1: conditioning on the state at the preceding time.** Time homogeneity means no new calculation is needed:

$$
\Pr(X_3=1\mid X_2=1)=q_{11}=\frac14,
\qquad
\Pr(X_4=3\mid X_3=2)=q_{23}=\frac23.
$$

**Question 2: the joint probability of a specified path.** If $\Pr(X_0=1)=1/3$, then

$$
\begin{aligned}
\Pr(X_0=1,X_1=2,X_2=3)
&=\Pr(X_0=1)q_{12}q_{23}\\
&=\frac13\cdot\frac12\cdot\frac23=\frac19.
\end{aligned}
$$

A path probability multiplies transition probabilities along the specified path. The probability of reaching a particular endpoint instead requires summing over all compatible paths.

**Question 3: the two-step distribution starting from 1.** Calculate the first row of $Q^2$:

$$
\begin{aligned}
q_{11}^{(2)}&=\frac14\frac14+\frac12\frac13+\frac14\frac12=\frac{17}{48},\\
q_{12}^{(2)}&=\frac14\frac12+\frac12\cdot0+\frac14\cdot0=\frac18,\\
q_{13}^{(2)}&=\frac14\frac14+\frac12\frac23+\frac14\frac12=\frac{25}{48}.
\end{aligned}
$$

The three entries sum to one, providing a direct check on the calculation.

**Question 4: conditional expectation.** Here the state labels $1,2,3$ are treated as numerical values, so

$$
\mathbb E[X_2\mid X_0=1]
=1\frac{17}{48}+2\frac18+3\frac{25}{48}
=\frac{13}{6}.
$$

If the states are merely categories such as “sunny, rainy, snowy,” assigning arbitrary numbers to them does not automatically give the resulting numerical mean a physical meaning. A more general formulation, and one better suited to reinforcement learning, uses a given function $h$ of the state:

$$
\mathbb E[h(X_n)\mid X_0=i]=\sum_j(Q^n)_{ij}h(j).
$$

### 5.6 How a fixed policy induces a state chain

Suppose the environment has the controlled Markov property, with transitions $P(s'\mid s,a)$, and the policy $\pi(a\mid s)$ depends only on the current state and does not change over time. Then

$$
Q^{\pi}(s,s')=\sum_a\pi(a\mid s)P(s'\mid s,a).
$$

First sample an action from the policy, then transition according to the environment. Together, these steps produce the state chain. Here “fixed policy” must be understood together with “a sufficient state, a stationary environment, and a Markov decision rule.” A fixed rule that depends on the entire history need not make the original $S_t$ alone a homogeneous Markov chain. If the policy keeps changing during learning, the corresponding state transitions will generally change over time as well.

<div class="recall-block">

**Recall | Answer first, then check**

1. For the three-state chain above, what is the probability of being in state 2 after two steps when starting from state 2? How does this differ from “having visited 2 within two steps”?
2. If the seasons change the weather transition law, can the model still be Markov?

<details class="recall-answer">
<summary>Check your answers</summary>
<div class="disclosure-body">

1. The former probability is $q_{21}q_{12}=1/6$. If the initial time is included, the latter probability is already one, so the time window for the hitting event must be specified first.
2. Yes. The Markov property constrains dependence on history. Homogeneity constrains dependence on absolute time. Neither condition can substitute for the other.

</div>
</details>
</div>

## 6. Markov Dynamics II: state classification, stationary distributions, and mixing

This chapter corresponds to logical pages 116–136 of Lecture 1. Three questions must be answered separately: where the chain can go, what distribution remains invariant in the long run, and how long it takes to approach that distribution from the current starting point.

### 6.1 Reachability, communication, communicating classes, and irreducibility

If there exists $n\ge0$ such that $(Q^n)_{ij}>0$, then $j$ is reachable from $i$, written $i\to j$. Allowing $n=0$ makes every state reachable from itself. If both $i\to j$ and $j\to i$, the states communicate, written $i\leftrightarrow j$.

Communication is an equivalence relation, so the state space splits into communicating classes. If a class $C$ cannot be left in one step, that is,

$$
q_{ij}=0,\qquad i\in C,\ j\notin C,
$$

then it is called a closed class. Once the chain enters a closed class, it never leaves. An absorbing state satisfying $q_{ii}=1$ is a closed class containing a single state.

If all states belong to the same communicating class, the chain is **irreducible**. Equivalently, for any two distinct states $i,j$, there is a finite path of positive probability from $i$ to $j$. Otherwise, the chain is reducible. Irreducibility is a reachability condition: it does not yet say whether the chain is certain to return whenever it starts from $i$, nor does it specify a convergence rate.

### 6.2 Recurrence and transience: will the chain eventually return?

Starting from $i$, define the first positive return time by

$$
T_i^+=\inf\{n\ge1:X_n=i\},
\qquad f_i=\Pr_i(T_i^+<\infty).
$$

- $f_i=1$: $i$ is **recurrent**. Starting from this state, the probability of eventually returning is one.
- $f_i<1$: $i$ is **transient**. There is a positive probability of never returning. This does not mean “returning is impossible.”

Restarting the same return trial after each visit to $i$ gives an additional criterion:

$$
\sum_{n=0}^{\infty}(Q^n)_{ii}
=\mathbb E_i\!\left[\sum_{n=0}^{\infty}\mathbf1\{X_n=i\}\right]
=\begin{cases}
1/(1-f_i),&f_i<1,\\
\infty,&f_i=1.
\end{cases}
$$

For example, in

$$
Q=\begin{pmatrix}1/2&1/2\\0&1\end{pmatrix}
$$

state 1 returns to itself on the next step with probability $1/2$ and enters state 2, which it can never leave, with probability $1/2$. Thus $f_1=1/2$, so state 1 is transient. State 2 is a recurrent absorbing state. Starting from 1 and including time zero, the expected number of visits to 1 is $2$.

**Every state of a finite irreducible chain is recurrent, and in fact positive recurrent.** Positive recurrence additionally requires $\mathbb E_i[T_i^+]<\infty$, which is stronger than having return probability one. The role of finiteness can be seen as follows. For a fixed target $i$, a path to that target can be found from every state, with a uniform finite upper bound on path length and a uniform positive lower bound on its probability of success. The probability of failing to reach $i$ over many successive blocks therefore decreases at least geometrically, giving the hitting time a finite mean. This is the proof idea for the finite case. A complete argument about return times still requires the Markov property.

The word “finite” cannot be dropped. An irreducible chain on a countably infinite state space may be transient, or it may be recurrent with an infinite mean return time.

Grouping the state graph into communicating classes, the examples in the notes can be restated as three structures that can be analyzed without a diagram:

- **One finite closed class:** all states in $\{1,2,3,4\}$ communicate, and the class cannot be left, so all four states are recurrent.
- **Two regions with a one-way exit:** the states in $A=\{1,2,3\}$ communicate with one another, while those in $B=\{4,5,6\}$ communicate with one another and form a closed class. A positive-probability transition $3\to4$ exists, but there is no path back from $B$ to $A$. Thus the states in $A$ are transient and those in $B$ are recurrent.
- **Two isolated closed classes:** $\{1,2,3\}$ and $\{4,5,6\}$ each consist of mutually communicating states, but neither class can reach the other. The entire chain is reducible, yet all six states are recurrent. Reducibility does not mean that all states are transient.

In a finite chain, every closed communicating class is recurrent, and states outside the closed classes are transient. This decomposition also explains why the long-run behavior of a reducible chain may depend on the class in which it starts or the closed class it eventually enters.

### 6.3 Periodicity: are return times locked to a beat?

The period of state $i$ is defined as

$$
d(i)=\gcd\{n\ge1:(Q^n)_{ii}>0\}.
$$

A state is aperiodic when $d(i)=1$. If there are no positive return times, this lecture adopts the convention $d(i)=+\infty$. Textbooks may use different notation for this special case. Communicating states have the same period, so an irreducible chain can be assigned a period as a whole.

Three examples rule out three different misreadings:

1. In the deterministic five-state directed cycle $1\to2\to3\to4\to5\to1$, returns are possible only after $5,10,15,\ldots$ steps, so the period is $5$. The chain is irreducible and recurrent, but its distribution from a deterministic starting state cycles rather than converging as time increases.
2. The matrix $\begin{pmatrix}0&1\\1&0\end{pmatrix}$, which deterministically swaps two states, has period $2$. Although its stationary distribution is $(1/2,1/2)$, a chain started from $(1,0)$ alternates forever.
3. A random walk on a triangle has no self-loops, but can return in two steps via $a\to b\to a$ and in three steps via $a\to b\to c\to a$. Since $\gcd(2,3)=1$, it is aperiodic.

The condition $q_{ii}>0$ is sufficient for that state to have period one. If the chain is irreducible, this property extends to the whole chain. This is the diagnostic shortcut emphasized in the handwritten annotation on logical page 124. A self-loop in one location, however, does not imply that every disconnected class is aperiodic.

### 6.4 A stationary distribution is a fixed point of the law, not a stopped path

A probability vector $\pi$ is called a stationary distribution if

$$
\pi=\pi Q,\qquad \pi_i\ge0,\qquad \sum_i\pi_i=1.
$$

In component form, $\pi_j=\sum_i\pi_iq_{ij}$. If $X_0\sim\pi$, the marginal distribution at every step is $\pi$. The particle still moves. It is the overall inflow and outflow that balance. Stationarity does not imply independence between adjacent states.

For the weather chain

$$
Q=\begin{pmatrix}0.8&0.2\\0.3&0.7\end{pmatrix},
\qquad \pi=(p,1-p),
$$

the equation becomes

$$
p=0.8p+0.3(1-p)=0.5p+0.3,
$$

Hence $\pi=(0.6,0.4)$. The long-run proportion of sunny days is obtained neither by simply averaging the two rows nor by looking only at the sunny-state self-loop probability $0.8$.

For a finite chain, three levels of conclusions must be kept distinct:

- At least one stationary distribution exists. Irreducibility is not required.
- Irreducibility guarantees a unique stationary distribution with strictly positive components. A reducible chain can also have a unique stationary distribution if it has only one closed class, so irreducibility is not a necessary and sufficient condition here.
- Adding aperiodicity to irreducibility guarantees convergence to $\pi$ as time increases from every initial distribution: $\mu_0Q^n\to\pi$.

When a reducible chain has multiple closed classes, any convex combination of the stationary distributions of those classes is also stationary. A periodic chain may have a unique stationary distribution without its distribution converging from a deterministic starting state. “Existence,” “uniqueness,” “convergence,” and “rapid convergence” cannot be collapsed into a single claim.

Time averages provide a related but distinct result. For a finite irreducible chain, even a periodic one, the ergodic average satisfies

$$
\frac1N\sum_{t=0}^{N-1}h(X_t)
\longrightarrow \sum_i\pi_i h(i)
\quad\text{almost surely}.
$$

This invokes the Markov chain ergodic theorem without proving it here. It is a different statement from convergence of the distribution at an individual time. For example, a chain that deterministically alternates between left and right still has visit frequencies approaching one half for each state.

### 6.5 Detailed balance and reversibility

If a probability vector $\pi$ satisfies all the pairwise equations

$$
\pi_iq_{ij}=\pi_jq_{ji},\qquad \forall i,j,
$$

then it satisfies detailed balance. The left and right sides are the one-step probability flows from $i$ to $j$ and from $j$ to $i$, respectively, in a stationary ensemble. This is stronger than requiring only that total inflow equal total outflow at each state.

The proof that detailed balance implies stationarity is short:

$$
(\pi Q)_i=\sum_j\pi_jq_{ji}
=\sum_j\pi_iq_{ij}
=\pi_i\sum_jq_{ij}=\pi_i.
$$

Irreducibility is not used here. It is needed for further conclusions such as uniqueness. For an irreducible chain on a countable state space, finding a properly normalized probability distribution satisfying these equations also establishes positive recurrence. In the finite-state setting of this lecture, positive recurrence already follows from irreducibility.

When $\pi_i>0$, the time-reversed transition probability under stationarity is

$$
q^*_{ij}=\Pr(X_{t-1}=j\mid X_t=i)
=\frac{\pi_jq_{ji}}{\pi_i}.
$$

Detailed balance gives $q^*_{ij}=q_{ij}$, so the chain is reversible with respect to $\pi$. More fully, a stationary path and its reversal have the same probability:

$$
\pi_{i_0}\prod_{r=0}^{n-1}q_{i_ri_{r+1}}
=
\pi_{i_n}\prod_{r=0}^{n-1}q_{i_{r+1}i_r}.
$$

Reversibility means that the distribution of a stationary path is invariant under time reversal. It does not mean that an individual physical trajectory retraces its steps.

**Detailed balance is sufficient for stationarity, but not necessary.** The uniform distribution on the one-way five-state cycle is stationary, yet probability flows in the forward direction and not in the reverse direction, so the chain is not reversible. This is a direct counterexample separating the two concepts.

If $Q$ is symmetric, meaning $q_{ij}=q_{ji}$, the uniform distribution satisfies detailed balance. The example in the notes is

$$
Q=\begin{pmatrix}
1/4&1/2&1/4\\
1/2&1/4&1/4\\
1/4&1/4&1/2
\end{pmatrix},\qquad
\pi=(1/3,1/3,1/3).
$$

Irreducibility makes this stationary distribution unique. More generally, a random walk that “chooses a neighbor uniformly” on a finite undirected graph satisfies

$$
q_{ij}=\frac{\mathbf1\{i\sim j\}}{\deg(i)},
\qquad \pi_i=\frac{\deg(i)}{2|E|}.
$$

The stationary probability flow in either direction between adjacent vertices is $1/(2|E|)$, so the walk is reversible. If the vertex degrees differ, however, $Q$ is generally not symmetric and the stationary distribution is not uniform. The triangle has a uniform stationary distribution precisely because every vertex has the same degree.

### 6.6 Total variation distance and mixing time

On a finite space, the total variation distance between two distributions is

$$
\|\mu-\nu\|_{\mathrm{TV}}
=\frac12\sum_x|\mu(x)-\nu(x)|
=\max_{A\subseteq\mathcal S}|\mu(A)-\nu(A)|.
$$

It lies in $[0,1]$. The event-based form shows that if TV is at most $\varepsilon$, the probabilities the two distributions assign to any event differ by at most $\varepsilon$. For example,

$$
\|(0.7,0.3)-(0.6,0.4)\|_{\mathrm{TV}}=0.1.
$$

For a chain with stationary distribution $\pi$, define the worst-case distance over initial distributions and the mixing time as

$$
d(t)=\max_{\mu_0}\|\mu_0Q^t-\pi\|_{\mathrm{TV}}
=\max_x\|Q^t(x,\cdot)-\pi\|_{\mathrm{TV}},
$$

$$
t_{\mathrm{mix}}(\varepsilon)
=\min\{t\ge0:d(t)\le\varepsilon\}.
$$

The second maximum only needs to range over deterministic starting states, because every initial distribution is a convex combination of point masses. A transition kernel cannot increase TV distance, so once the distance reaches the threshold it cannot rise above it again. If the chain fails to converge, the mixing time for a given threshold may be infinite.

The weather chain turns these definitions into concrete numbers. Let $p_t=\Pr(X_t=S)$. Then

$$
p_{t+1}=0.8p_t+0.3(1-p_t)=0.5p_t+0.3,
\qquad p_t-0.6=2^{-t}(p_0-0.6).
$$

On a two-state space, TV is simply the absolute difference between the sunny-state probabilities, so

$$
d(t)=0.6\,2^{-t}.
$$

For example, $t_{\mathrm{mix}}(0.05)=4$, because $0.6/2^3=0.075$ is still greater than $0.05$, whereas $0.6/2^4=0.0375$ meets the requirement. Maximizing over starting states matters here: if the chain starts only from sunny, the coefficient is $0.4$, not the worst-case value $0.6$.

Why does a finite irreducible aperiodic chain forget its initial state? The proof starts from the fact that there is some $N$ for which every entry of $Q^N$ is positive. Thus, after $N$ steps, the distributions from all starting states contain a common portion of probability mass shared by every starting state. Removing that common portion leaves a strictly smaller discrepancy, and iteration yields convergence. The existence of such a matrix power is invoked here as a standard result. This does not prove that a particular $N$, or the mixing time, is small.

### 6.7 Bottlenecks, conductance, and the spectral gap: why some chains mix slowly

Logical pages 135–136 illustrate slow mixing with a graph consisting of two densely connected clusters joined only by a narrow passage. Even if every state can reach every other state, the chain can remain trapped in one cluster for a long time. Irreducibility requires only that the passage probability be positive, not that it be large.

To quantify a “bottleneck,” define the stationary flow for a finite irreducible chain by

$$
F(A,A^c)=\sum_{i\in A,j\notin A}\pi_iq_{ij},
$$

and the conductance by

$$
\Phi=\min_{0<\pi(A)\le1/2}\frac{F(A,A^c)}{\pi(A)}.
$$

The denominator is the stationary mass inside the region, and the numerator is the stationary flow that can escape in one step. A region with substantial mass but a very narrow exit makes $\Phi$ small. Having many edges in the graph is not necessarily enough. The probability weights and the mass of the separated region also matter.

The spectral viewpoint asks how quickly modes of deviation other than the stationary mode decay. For a finite irreducible reversible chain, the eigenvalues are real and can be ordered as

$$
1=\lambda_1>\lambda_2\ge\cdots\ge\lambda_M\ge-1.
$$

After $t$ steps, each nonstationary mode is multiplied by its corresponding $\lambda_k^t$. In general, the relevant quantities are

$$
\lambda_* =\max_{k\ge2}|\lambda_k|,
\qquad \gamma_*=1-\lambda_*.
$$

One cannot look only at $1-\lambda_2$ while ignoring eigenvalues close to $-1$: the other eigenvalue of the deterministic two-state swap chain is exactly $-1$, producing oscillations that never decay. Making the chain lazy, using $Q_{\mathrm{lazy}}=(I+Q)/2$, preserves the same stationary distribution while eliminating this negative-eigenvalue issue.

For a lazy reversible finite chain, the spectral gap is usually written as $\gamma=1-\lambda_2$. Under these conditions, the Cheeger-type relation

$$
\frac{\Phi^2}{2}\le\gamma\le2\Phi
$$

connects bottlenecks to the spectrum. A standard upper bound illustrating the scale of mixing is

$$
d(t)\le\frac{1}{2\sqrt{\pi_{\min}}}(1-\gamma)^t
\le\frac{1}{2\sqrt{\pi_{\min}}}e^{-\gamma t}.
$$

These definitions, conditions, and standard results supplement the lecture's chain of reasoning, “large conductance $\to$ large spectral gap $\to$ rapid mixing.” They are not spectral-theory proofs developed in this lecture. They also show that mixing time is not determined by a single spectral-gap value: dependence on $\pi_{\min}$ and the desired accuracy also appears.

For a family of chains growing with problem size $n$, the notes contrast polynomial mixing, $t_{\mathrm{mix}}^{(n)}(\varepsilon)=\operatorname{poly}(n,\log(1/\varepsilon))$, with slow mixing that may take as long as $e^{\Omega(n)}$. It must be specified whether $n$ means the number of states, the dimension, or the input size. These are different quantities, and the comparison is not an unconditional dichotomy covering all fast and slow chains. Geometric error decay over time for a fixed chain is entirely compatible with an exponential increase, across a family of chains, in the time needed to reach a fixed accuracy as the problem size grows.

In reinforcement learning, slow mixing can hinder exploration across regions and preserve dependence in trajectory data. A thousand consecutive frames cannot be equated with a thousand independent experiments. Negative correlation can nevertheless reduce the variance of some time averages, so “slow mixing” does not mean that every statistic deteriorates in the same way. The particular return or indicator function of interest must be analyzed.

### 6.8 RL connection: discounted occupancy is not a stationary distribution

After fixing a stationary policy, the state transition kernel is $Q^\pi$. Beyond long-run limits, RL also asks which states are visited most heavily under discounting from a specified initial distribution. Given an initial distribution $\mu_0$ and $0\le\gamma<1$, the normalized discounted state occupancy distribution is

$$
d_\gamma^\pi=(1-\gamma)\sum_{t=0}^{\infty}\gamma^t\mu_0(Q^\pi)^t.
$$

Each term being averaged is a probability distribution, and the weights sum to one, so $d_\gamma^\pi$ is also a probability distribution. It satisfies

$$
d_\gamma^\pi=(1-\gamma)\mu_0+\gamma d_\gamma^\pi Q^\pi.
$$

This differs from the ordinary stationary equation $\pi=\pi Q$: discounted occupancy explicitly includes the initial distribution and gives greater weight to earlier times. This discounted weighting remains well defined even if the original chain does not mix. It can also be interpreted as the stationary distribution of a “chain with restarts,” which restarts from $\mu_0$ with probability $1-\gamma$ at every step.

For example, if the weather chain starts from sunny, then $\Pr(S_t=S)=0.6+0.4\cdot2^{-t}$. With $\gamma=0.9$, the discounted sunny-state occupancy is

$$
d_\gamma(S)=0.6+\frac{0.4(1-\gamma)}{1-\gamma/2}
\approx0.6727,
$$

which differs from the long-run stationary sunny-state probability $0.6$. Sunny days are more frequent initially, and those early times receive greater weight. The notes mention discounted occupancy alongside stationary distributions. The definition is supplied here to avoid conflating the two visitation distributions.

<div class="recall-block">

**Recall | Answer first, then check**

1. Why might a chain with a unique stationary distribution still fail to have a finite mixing time?
2. If a random walk on an undirected graph chooses neighbors uniformly, does it visit all vertices uniformly?

<details class="recall-answer">
<summary>Check your answers</summary>
<div class="disclosure-body">

1. An irreducible deterministic two-state swap chain is a counterexample: periodicity makes a point mass oscillate back and forth. Uniqueness and convergence of the distribution as time increases are different properties.
2. Not in general. Stationary mass is proportional to degree. Symmetric edges do not imply that the normalized transition matrix is symmetric.

</div>
</details>
</div>

## 7. Statistical Inference: inferring unknown parameters from observations

This chapter corresponds to logical pages 138–163 of Lecture 1, including the complete conjugate-model tables on the image-based pages. Begin by distinguishing three objects: the parameterized model, the observed data, and the rule that produces an estimate from the data.

### 7.1 Parameterized models, frequentist inference, and Bayesian inference

Let the model family be

$$
\mathcal F=\{p(x;\theta):\theta\in\mathcal T\}.
$$

For example, the normal family is parameterized by $\theta=(\mu,\sigma^2)$:

$$
f(x;\mu,\sigma^2)
=\frac1{\sqrt{2\pi\sigma^2}}
\exp\!\left(-\frac{(x-\mu)^2}{2\sigma^2}\right),
\qquad \mu\in\mathbb R,\ \sigma^2>0.
$$

We know the model family, but not which parameter values within it generated the data. A parameter may be a scalar, vector, or matrix. The parameter space $\mathcal T$ should not be misread as always being the entire real line.

The frequentist approach treats $\theta$ as a fixed but unknown constant, while the data $X$ and the estimator $\widehat\theta(X)$ are random. It can study point estimation as well as hypothesis testing. The lecture distinguishes the simple hypotheses $H_0:\theta=1/2$ versus $H_1:\theta=3/4$ from the composite alternative $H_1:\theta\ne1/2$. The former specifies one particular parameter value, whereas the latter allows multiple values. Here we only establish the types of problems involved. This is not a completed tutorial on significance testing.

The Bayesian approach represents uncertainty about the unknown parameter $\Theta$ with a prior distribution, then updates it using an observation model. The prior may come from symmetry, a known range, earlier experiments, or subjective modeling choices. “Bayesian” does not automatically make a prior objective. Assigning a probability distribution to a parameter also does not mean that the physical parameter must be randomly generated anew before every experiment.

### 7.2 Likelihood and MLE

Given the actual observations $x=(x_1,\ldots,x_n)$, the likelihood fixes the data and treats the parameter as its variable:

$$
L(\theta;x)=p(x;\theta),\qquad
\widehat\theta_{\mathrm{MLE}}\in\operatorname*{arg\,max}_{\theta\in\mathcal T}L(\theta;x).
$$

The same expression is a sampling distribution when viewed as a function of $x$, and a likelihood when viewed as a function of $\theta$. The likelihood is not a “probability distribution over parameters,” and it generally does not integrate to one over the parameter. Continuous observations require a density. $\Pr(X=x)=0$ does not mean that every parameter has zero likelihood.

If the data are independent and identically distributed conditional on the parameter, then

$$
L(\theta;x)=\prod_{i=1}^{n}p(x_i;\theta),\qquad
\ell(\theta;x)=\sum_{i=1}^{n}\log p(x_i;\theta).
$$

Because the logarithm is strictly increasing, maximizing $L$ is equivalent to maximizing $\ell$. Taking logarithms turns products into sums and also mitigates numerical underflow from multiplying small probabilities. When the observations are not independent, we cannot simply multiply their marginal distributions. The joint likelihood of a Markov trajectory requires the initial distribution multiplied by the conditional transition probabilities at each step.

For a Bernoulli sample with $k$ successes and $n-k$ failures,

$$
\ell(\theta)=k\log\theta+(n-k)\log(1-\theta)+C.
$$

When $0<k<n$, set the derivative to zero:

$$
\frac{k}{\theta}-\frac{n-k}{1-\theta}=0
\quad\Longrightarrow\quad\widehat\theta_{\mathrm{MLE}}=\frac{k}{n}.
$$

If the parameter space includes $[0,1]$, the maximum for an all-success or all-failure sample occurs at the boundary $1$ or $0$, respectively. If only the open interval is allowed, these boundary cases may have a supremum but no attained MLE.

A normal sample provides another tractable example: if the variance is known, the MLE of $\mu$ is $\bar x$. If both the mean and variance are unknown and the sample is nondegenerate,

$$
\widehat\mu_{\mathrm{MLE}}=\bar x,
\qquad
\widehat{\sigma^2}_{\mathrm{MLE}}
=\frac1n\sum_i(x_i-\bar x)^2.
$$

The denominator is $n$, not the $n-1$ used to obtain an unbiased estimator. Maximum likelihood and unbiasedness are different objectives.

### 7.3 Bayes updating: the complete output is a posterior distribution

Use PMFs for the prior and posterior when the parameter is discrete, and PDFs when it is continuous. In unified notation,

$$
\text{posterior}\ \propto\ \text{likelihood}\times\text{prior}.
$$

Remembering “proportional to” is not enough: the complete posterior still needs normalization. The image on logical page 146 lists four combinations, whose full forms are as follows.

**Discrete parameter, discrete observation:**

$$
p_{\Theta\mid X}(\theta\mid x)
=\frac{p_\Theta(\theta)p_{X\mid\Theta}(x\mid\theta)}
{\sum_{\theta'}p_\Theta(\theta')p_{X\mid\Theta}(x\mid\theta')}.
$$

**Discrete parameter, continuous observation:**

$$
p_{\Theta\mid X}(\theta\mid x)
=\frac{p_\Theta(\theta)f_{X\mid\Theta}(x\mid\theta)}
{\sum_{\theta'}p_\Theta(\theta')f_{X\mid\Theta}(x\mid\theta')}.
$$

**Continuous parameter, discrete observation:**

$$
f_{\Theta\mid X}(\theta\mid x)
=\frac{f_\Theta(\theta)p_{X\mid\Theta}(x\mid\theta)}
{\int f_\Theta(u)p_{X\mid\Theta}(x\mid u)\,du}.
$$

**Continuous parameter, continuous observation:**

$$
f_{\Theta\mid X}(\theta\mid x)
=\frac{f_\Theta(\theta)f_{X\mid\Theta}(x\mid\theta)}
{\int f_\Theta(u)f_{X\mid\Theta}(x\mid u)\,du}.
$$

Whether to sum or integrate is determined by the type of unknown parameter being normalized. Whether to use a probability mass or a density for the data is determined by the observation type. The denominator is the evidence, meaning the marginal probability or density of the data, and must be finite and positive. For continuous variables, these identities hold in terms of the relevant conditional densities. They do not substitute a zero-probability event directly into the elementary ratio of event probabilities.

Why is this Bayes' rule? The joint distribution can be factored either as “parameter first, then data” or as “data first, then parameter”:

$$
p(\theta,x)=p(x\mid\theta)p(\theta)
=p(\theta\mid x)p(x).
$$

Computing $p(x)$ by total probability or marginalization then gives the four forms above. The probability and density symbols here must be changed to match the types of the variables.

The posterior distribution is the complete output of Bayesian inference: it can retain spread, skewness, multiple modes, and even the allocation of mass among different hypotheses. A point estimate only compresses that distribution. It cannot represent all the uncertainty.

### 7.4 MAP, posterior mean, and loss functions

The maximum a posteriori estimate is

$$
\widehat\theta_{\mathrm{MAP}}
\in\operatorname*{arg\,max}_\theta p(\theta\mid x)
=\operatorname*{arg\,max}_\theta p(x\mid\theta)p(\theta).
$$

Equivalently, we can maximize $\log L(\theta;x)+\log p(\theta)$. The evidence does not depend on the $\theta$ being optimized, so it can be omitted when finding the maximum. It cannot, however, be discarded arbitrarily when comparing the evidence for different models. When the prior is constant in a given coordinate system, MAP and MLE have the same maximization objective. For continuous parameters, a “uniform prior” and the location of a density peak are affected by coordinate transformations, so this does not make MAP invariant under every reparameterization.

The posterior mean is

$$
\widehat\theta_{\mathrm{PM}}(x)=\mathbb E[\Theta\mid X=x].
$$

As a random estimator before observing the data, it is written $\widehat\Theta=\mathbb E[\Theta\mid X]$. Only after substituting the observed data do we obtain a numerical value. With a finite second moment, for any output $a$,

$$
\mathbb E[(\Theta-a)^2\mid X=x]
=\operatorname{Var}(\Theta\mid X=x)
+\bigl(a-\mathbb E[\Theta\mid X=x]\bigr)^2.
$$

Thus the posterior mean minimizes posterior squared-error risk. This connects directly to the earlier chapter on “conditional expectation as a projection.” It does not say that the mean is the right output under every loss: absolute error leads to a posterior median, while exact-match 0–1 loss for a discrete parameter leads to MAP. For a continuous parameter, the probability of an exact match is usually zero, so the discrete 0–1 loss argument cannot be carried over without explanation to establish MAP optimality.

### 7.5 The Beta distribution: shape, mean, and variance

For $a,b>0$, the density

$$
f(\theta)=\frac{\theta^{a-1}(1-\theta)^{b-1}}{B(a,b)},
\qquad 0<\theta<1,
$$

defines $\operatorname{Beta}(a,b)$. Its normalizing constant is

$$
B(a,b)=\int_0^1\theta^{a-1}(1-\theta)^{b-1}\,d\theta
=\frac{\Gamma(a)\Gamma(b)}{\Gamma(a+b)}.
$$

It is suitable for modeling a success probability because its range is precisely $(0,1)$. The uniform distribution is $\operatorname{Beta}(1,1)$. Not every Beta distribution is uniform.

The four shape plots on logical page 154 are:

- $\operatorname{Beta}(1/2,1/2)$: U-shaped, with high density near both endpoints, favoring probabilities close to zero or one. A divergent density does not give the endpoints positive probability mass.
- $\operatorname{Beta}(2,1)$: its density is $2\theta$, increasing with $\theta$.
- $\operatorname{Beta}(2,8)$: mass concentrates around smaller success probabilities. The mean is $0.2$ and the mode is $1/8$.
- $\operatorname{Beta}(5,5)$: symmetric about $1/2$, with a single central peak.

Ratios of Beta functions give

$$
\mathbb E[\Theta]=\frac{B(a+1,b)}{B(a,b)}=\frac{a}{a+b},
\qquad
\mathbb E[\Theta^2]=\frac{a(a+1)}{(a+b)(a+b+1)},
$$

and hence

$$
\operatorname{Var}(\Theta)
=\frac{ab}{(a+b)^2(a+b+1)}.
$$

With the mean fixed, a larger $a+b$ generally indicates a more concentrated distribution. Equal means do not imply equal uncertainty.

### 7.6 Beta–Binomial conjugacy: computing the denominator as well

Let the unknown probability of heads be $\Theta\sim\operatorname{Beta}(a,b)$. Conditional on $\Theta=\theta$, the $n$ trials are independent, and the number of successes satisfies

$$
K\mid\Theta=\theta\sim\operatorname{Binomial}(n,\theta).
$$

After observing $K=k$, the likelihood is

$$
\Pr(K=k\mid\theta)=\binom nk\theta^k(1-\theta)^{n-k}.
$$

Multiplying it by the prior adds the exponents that depend on $\theta$:

$$
f(\theta\mid K=k)
\propto\theta^{a+k-1}(1-\theta)^{b+n-k-1}.
$$

The normalizing constant can be computed explicitly rather than left as an unknown $C$:

$$
\Pr(K=k)=\binom nk\frac{B(a+k,b+n-k)}{B(a,b)}.
$$

Substitution into Bayes' rule gives the complete posterior

$$
f(\theta\mid K=k)
=\frac{\theta^{a+k-1}(1-\theta)^{b+n-k-1}}{B(a+k,b+n-k)},
$$

$$
\Theta\mid K=k\sim\operatorname{Beta}(a+k,b+n-k).
$$

Because the prior and posterior remain in the same distribution family, Beta is called a **conjugate prior** for the Binomial likelihood. This is computational closure, not proof that Beta is necessarily the best choice for every practical problem. If the data record a particular sequence of successes and failures, the likelihood lacks the binomial coefficient. Because that coefficient does not depend on $\theta$, the parameter posterior is still the same.

The three summaries differ:

$$
\widehat\theta_{\mathrm{MLE}}=\frac{k}{n},\qquad
\widehat\theta_{\mathrm{PM}}=\frac{a+k}{a+b+n},
$$

$$
\widehat\theta_{\mathrm{MAP}}=
\frac{a+k-1}{a+b+n-2}
\quad\text{only when }a+k>1,\ b+n-k>1.
$$

The final MAP expression comes from differentiating the posterior log density, but applies only to an interior mode. If both updated parameters equal one, the posterior is uniform and the maximizer is not unique. When a parameter is at most one, the density may peak near a boundary or even have only an infinite supremum on the open interval. The interior formula cannot be applied mechanically.

The posterior mean can also be written as

$$
\frac{a+k}{a+b+n}
=\frac{a+b}{a+b+n}\frac{a}{a+b}
+\frac{n}{a+b+n}\frac{k}{n},\qquad n>0.
$$

It weights the prior mean and the sample proportion by prior strength and data size. This motivates interpreting $a,b$ as “success and failure pseudocounts.” They need not be integers, however, and need not actually come from $a+b$ historical trials. If the density exponents are instead described relative to a uniform baseline prior, $a-1,b-1$ appear, so the pseudocount convention must be specified.

Under a uniform prior, the posterior mean is $(k+1)/(n+2)$. Even when $k=n$, it is $(n+1)/(n+2)$: a finite run of successes does not force the unknown success probability to equal one. Only as the data size tends to infinity with the prior fixed does the prior weight gradually vanish. This also presumes a fixed success probability, conditional independence, and an appropriate model.

### 7.7 Conjugate models for discrete likelihoods

To avoid confusing the rate and scale conventions used by different textbooks, we use the following Gamma shape–rate parameterization throughout:

$$
f(\lambda)=\frac{b^a}{\Gamma(a)}\lambda^{a-1}e^{-b\lambda},
\quad\lambda>0,\ a,b>0.
$$

For conditionally independent samples $x_1,\ldots,x_n$, the main discrete combinations are:

| Likelihood model | Unknown parameter and prior | Posterior |
|---|---|---|
| $X_i\sim\operatorname{Bernoulli}(\theta)$ | $\theta\sim\operatorname{Beta}(a,b)$ | $\operatorname{Beta}(a+\sum_i x_i,\ b+n-\sum_i x_i)$ |
| $X_i\sim\operatorname{Poisson}(\lambda)$ | $\lambda\sim\operatorname{Gamma}(a,b)$ | $\operatorname{Gamma}(a+\sum_i x_i,\ b+n)$ |
| $X_i\sim\operatorname{Geometric}(\theta)$, taking values $1,2,\ldots$ | $\theta\sim\operatorname{Beta}(a,b)$ | $\operatorname{Beta}(a+n,\ b+\sum_i x_i-n)$ |
| Category counts $c_1,\ldots,c_K$, probability vector $\boldsymbol\theta$ | $\boldsymbol\theta\sim\operatorname{Dirichlet}(\alpha_1,\ldots,\alpha_K)$ | $\operatorname{Dirichlet}(\alpha_1+c_1,\ldots,\alpha_K+c_K)$ |

The likelihood kernel in the Poisson row is $\lambda^{\sum x_i}e^{-n\lambda}$. Multiplying it by the Gamma kernel shows that the shape increases by the total count and the rate by the number of observation periods. If observation durations differ, use the total exposure time rather than automatically writing $n$.

**A necessary correction to the original table:** logical page 162 pairs the ordinary Geometric success-probability model with a Gamma prior. This is not valid under the usual $0<\theta<1$ parameterization. Since

$$
\Pr(X_i=x_i\mid\theta)=\theta(1-\theta)^{x_i-1},
\qquad L(\theta)\propto\theta^n(1-\theta)^{\sum_i x_i-n},
$$

the conjugate family is Beta. If the geometric variable counts failures before the first success and starts at zero, the posterior becomes $\operatorname{Beta}(a+n,b+\sum_i x_i)$. This is not a rate-versus-scale notational difference in a Gamma update.

Dirichlet generalizes Beta to the probability simplex for multiple categories and requires each $\alpha_k>0$. Its density in the interior of the simplex is:

$$
f(\boldsymbol\theta)
=\frac{\Gamma(\sum_k\alpha_k)}{\prod_k\Gamma(\alpha_k)}
\prod_k\theta_k^{\alpha_k-1},
\quad \theta_k>0,\ \sum_k\theta_k=1.
$$

The parameter-dependent kernel of the Multinomial likelihood is $\prod_k\theta_k^{c_k}$, so each category adds its own count. The $n\bar X$ in the image-based table should be read as the cumulative vector of category counts. If each sample itself contains multiple categorical trials, the total number of trials must not be confused with the number of samples $n$.

### 7.8 Conjugate models for continuous likelihoods: specifying each parameterization

The table on logical page 163 includes not only normal means but also a uniform endpoint, an exponential rate, variance, and multivariate covariance. Throughout the following, samples are assumed independent conditional on the parameter.

**1. Uniform distribution with an unknown upper endpoint.** If $X_i\mid\theta\sim\operatorname{Uniform}(0,\theta)$, model the endpoint with a Pareto prior

$$
f(\theta)=kv_0^k\theta^{-(k+1)}\mathbf1\{\theta\ge v_0\},
\quad v_0,k>0,
$$

and use the likelihood $\theta^{-n}\mathbf1\{\theta\ge x_{(n)}\}$, where $x_{(n)}=\max_i x_i$. This gives

$$
\theta\mid x\sim\operatorname{Pareto}\bigl(\max\{v_0,x_{(n)}\},\ k+n\bigr).
$$

The samples must be nonnegative and consistent with the uniform model. The maximum changes the posterior support, so updating the density exponent alone is insufficient.

**2. Unknown rate of an exponential distribution.** If

$$
f(x_i\mid\theta)=\theta e^{-\theta x_i}\mathbf1\{x_i\ge0\},
\qquad \theta\sim\operatorname{Gamma}(a,b),
$$

then

$$
\theta\mid x\sim\operatorname{Gamma}\left(a+n,b+\sum_i x_i\right).
$$

Here $\theta$ is the rate. If it represents the mean or scale, the prior and update must be rewritten accordingly. The name “Exponential” alone is not enough to justify copying the formula.

**3. Unknown normal mean, known variance.** If $X_i\mid\mu\sim\mathcal N(\mu,\sigma^2)$, $\mu\sim\mathcal N(\mu_0,\tau_0^2)$, and $\sigma^2,\tau_0^2>0$, then

$$
\tau_n^2=\left(\frac1{\tau_0^2}+\frac n{\sigma^2}\right)^{-1},
\qquad
\mu_n=\tau_n^2\left(\frac{\mu_0}{\tau_0^2}+\frac{n\bar x}{\sigma^2}\right),
$$

$$
\mu\mid x\sim\mathcal N(\mu_n,\tau_n^2).
$$

Precision is the reciprocal of variance: prior precision and data precision add, and the mean is weighted by precision. This resembles the “prior–data compromise” in the Beta posterior mean, but the weights are no longer simply counts.

**4. Known normal mean, unknown variance.** Let $v=\sigma^2$, using the inverse Gamma density kernel $v^{-a-1}e^{-b/v}$. If $v\sim\operatorname{InvGamma}(a,b)$ with $a,b>0$, then

$$
v\mid x\sim\operatorname{InvGamma}\left(a+\frac n2,
\ b+\frac12\sum_i(x_i-\mu)^2\right).
$$

This uses the sum of squared deviations from the known $\mu$, not merely the squared distance between the sample mean and $\mu$.

**5. The same variance problem in scaled inverse-$\chi^2$ notation.** For $\nu_0,s_0^2>0$, define $\operatorname{ScaleInv}\chi^2(\nu_0,s_0^2)$ to be equivalent to $\operatorname{InvGamma}(\nu_0/2,\nu_0s_0^2/2)$. Then

$$
\nu_n=\nu_0+n,
\qquad s_n^2=
\frac{\nu_0s_0^2+\sum_i(x_i-\mu)^2}{\nu_0+n},
$$

$$
v\mid x\sim\operatorname{ScaleInv}\chi^2(\nu_n,s_n^2).
$$

This is a reparameterization of the same conjugate relationship as the preceding item, not a different form of data evidence.

**6. Unknown multivariate normal mean, known covariance.** If $X_i\mid\boldsymbol\mu\sim\mathcal N(\boldsymbol\mu,\Sigma)$ and $\boldsymbol\mu\sim\mathcal N(\boldsymbol\mu_0,\Sigma_0)$, with both covariance matrices positive definite, then

$$
K=(\Sigma_0^{-1}+n\Sigma^{-1})^{-1},
\qquad
\boldsymbol\mu\mid x\sim
\mathcal N\!\left(K(\Sigma_0^{-1}\boldsymbol\mu_0+n\Sigma^{-1}\bar x),K\right).
$$

This is the matrix version of precision weighting. Matrix multiplication cannot be reordered arbitrarily based on scalar intuition.

**7. Known multivariate normal mean, unknown covariance.** In dimension $d$, let $\Sigma\sim\operatorname{InvWishart}(\nu_0,S_0)$ with density kernel

$$
|\Sigma|^{-(\nu_0+d+1)/2}
\exp\!\left[-\tfrac12\operatorname{tr}(S_0\Sigma^{-1})\right],
\qquad \nu_0>d-1,\ S_0\succ0,
$$

Then

$$
\Sigma\mid x\sim\operatorname{InvWishart}
\left(\nu_0+n,
S_0+\sum_i(x_i-\boldsymbol\mu)(x_i-\boldsymbol\mu)^\top\right).
$$

**The limits of the original table's notation:** the mean is known in this row, so the update requires the scatter matrix about that known mean. Only if $\bar S$ is explicitly defined as $n^{-1}\sum_i(x_i-\boldsymbol\mu)(x_i-\boldsymbol\mu)^\top$ may the update be written as $S_0+n\bar S$. The usual sample covariance about the sample mean cannot simply be substituted. If the mean is also unknown, an appropriate joint prior is needed. The “known mean” condition cannot simply be deleted.

The common operation in these tables is to write the likelihood kernel, multiply it by the prior, and update exponents, quadratic forms, or support conditions. Listing these families in the lecture does not amount to a systematic proof of all their distributional properties. The parameterizations and update formulas here make them usable rather than preserving only their names.

<div class="recall-block">

**Recall | Answer first, then check**

1. After observing ten successes and zero failures, what are the MLE, MAP, and posterior mean under a uniform prior?
2. The geometric waiting times are $2,3,1$. With a $\operatorname{Beta}(2,2)$ prior, what is the posterior?

<details class="recall-answer">
<summary>Check the answers</summary>
<div class="disclosure-body">

1. If boundary points are allowed, the MLE is $1$, the $\operatorname{Beta}(11,1)$ posterior density peaks at the upper boundary, and the posterior mean is $11/12$. Under an open-interval parameterization, the first two should be described as approaching their suprema at the boundary, not as having invented interior maxima.
2. There are three successes and three failures in total, giving the posterior $\operatorname{Beta}(5,5)$. First establish that waiting times are counted starting at one. Only then can the final success in each trial sequence be subtracted correctly.

</div>
</details>
</div>

## 8. Bayesian Learning: retain uncertainty, then predict and act

This chapter corresponds to logical pages 165–172 of Lecture 1. The preceding chapter inferred unknown parameters. This chapter puts the posterior back into sequential learning: new data continue to update beliefs, the posterior is used to predict the future, and it can also support exploration and hidden-state estimation.

### 8.1 Sequential Bayes updating and a Beta–Bernoulli example

Let the existing data be $D_t$ and the new observation be $x_{t+1}$. Then

$$
p(\theta\mid D_t,x_{t+1})
\propto p(x_{t+1}\mid\theta,D_t)p(\theta\mid D_t).
$$

The old posterior becomes the new prior. This step follows from two factorizations of the joint distribution and does not itself require independent data. Conditional independence given the parameter is used only when we further simplify the new-observation model to $p(x_{t+1}\mid\theta)$.

For a Bernoulli arm with a fixed success probability and prior $\Theta\sim\operatorname{Beta}(a,b)$, after a cumulative $s$ successes and $f$ failures,

$$
\Theta\mid D\sim\operatorname{Beta}(a+s,b+f),
\qquad \mathbb E[\Theta\mid D]=\frac{a+s}{a+b+s+f}.
$$

Each success adds one only to the first parameter, and each failure adds one to the second. When the model is unchanged and the data satisfy conditional independence, one batch update gives the same result as updating observations one by one in any order.

The lecture's numerical example uses a $\operatorname{Beta}(1,1)$ prior with seven successes and three failures:

$$
\Theta\mid D\sim\operatorname{Beta}(8,4),
\qquad \mathbb E[\Theta\mid D]=\frac8{12}=\frac23.
$$

The MLE for the same data is $0.7$. The interior MAP of this posterior is $7/10=0.7$. Under a uniform prior, equality of MAP and MLE does not imply that they also equal the posterior mean. The posterior variance is

$$
\operatorname{Var}(\Theta\mid D)
=\frac{8\cdot4}{12^2\cdot13}=\frac2{117}.
$$

This distribution answers not only “what is the estimated success probability?” but also “which parameters remain plausible?” If the success probability drifts because of wear or environmental changes, continuing to accumulate all past counts may make the posterior incorrectly overconfident. That requires a change of model, not just mechanically adding one.

### 8.2 Posterior prediction: predicting data, not estimating another parameter point

The posterior predictive distribution of a future observation is

$$
p(x_{\mathrm{new}}\mid D)
=\int p(x_{\mathrm{new}}\mid\theta,D)p(\theta\mid D)\,d\theta.
$$

For a discrete parameter, replace the integral with a sum. Predict the future under each possible parameter, then weight those predictions by the posterior. Do not indiscriminately substitute a single parameter value into the model.

In the Beta–Bernoulli model, conditional on $\theta$, the probability of a future success is $\theta$. Therefore,

$$
\Pr(X_{\mathrm{new}}=1\mid D)
=\int\theta p(\theta\mid D)\,d\theta
=\mathbb E[\Theta\mid D]
=\frac{a+s}{a+b+s+f}.
$$

This happens to equal substituting the posterior mean into the Bernoulli success probability, because that probability is linear in the parameter. It is not a theorem that posterior prediction generally equals a plug-in prediction.

For example, writing $A=a+s,B=b+f$, the probability that the next two trials both succeed is

$$
\Pr(X_{n+1}=1,X_{n+2}=1\mid D)
=\mathbb E[\Theta^2\mid D]
=\frac{A(A+1)}{(A+B)(A+B+1)},
$$

which generally differs from $[A/(A+B)]^2$. For $\operatorname{Beta}(8,4)$, the former is $6/13\approx0.4615$ and the latter is $4/9\approx0.4444$. Future observations are independent conditional on $\Theta$, but become correlated after the shared parameter is integrated out. Their covariance is $\operatorname{Var}(\Theta\mid D)$.

More generally, for $m$ future trials, the number of successes $K_{\mathrm{new}}$ has a Beta–Binomial posterior predictive distribution:

$$
\Pr(K_{\mathrm{new}}=k\mid D)
=\binom mk\frac{B(A+k,B+m-k)}{B(A,B)}.
$$

This supplementary example shows the practical value of retaining the full posterior: even if two posteriors have the same mean and predict the same probability of one success, they may give different assessments of multiple outcomes and the value of exploration.

### 8.3 Thompson Sampling: sample a possible world from the posterior

Logical page 168 only previews Thompson Sampling. Its minimal procedure for a Bernoulli multi-armed bandit is:

1. For each arm $a$, maintain a posterior $\theta_a\mid D\sim\operatorname{Beta}(\alpha_a,\beta_a)$.
2. In each round, draw $\widetilde\theta_a$ from each arm's posterior and choose $a_t\in\operatorname*{arg\,max}_a\widetilde\theta_a$.
3. Observe reward $r_t\in\{0,1\}$ and update only the arm observed in that round: $\alpha_{a_t}\leftarrow\alpha_{a_t}+r_t$ and $\beta_{a_t}\leftarrow\beta_{a_t}+1-r_t$.

Sampling the arms independently in this way relies on modeling assumptions such as independent arm priors. If parameters are correlated, sample from their joint posterior instead of arbitrarily separating them. Exploration comes from posterior uncertainty: an arm with a modest mean but a broad distribution can still be sampled as the most promising candidate in a particular round. Comparing only posterior means gives a different, greedy rule, not Thompson Sampling.

For example, if the two posterior samples in a round are $0.61$ and $0.76$, choose the second arm. This does not assert that its true success rate has been established as $0.76$. It means acting greedily in the possible parameter world sampled this time. The discussion here explains the algorithm's mechanism. It does not claim to prove a regret bound, nor does it treat this bandit preview as a complete tutorial on posterior sampling for an unknown MDP.

### 8.4 POMDPs: maintain a belief over hidden states, not just one observation frame

In a partially observable Markov decision process, the hidden state $S_t$ evolves according to action-controlled transitions, and the agent sees the observation $O_t$, not the state itself. The diagram on logical page 170 contains four kinds of objects—states, observations, actions, and rewards—with the central idea being

$$
\text{hidden state}\ \longrightarrow\ \text{belief about the state}\ \longrightarrow\ \text{action}.
$$

A belief is not another point guess of the true state, but an entire posterior distribution:

$$
b_t(s)=\Pr(S_t=s\mid O_{1:t},A_{1:t-1}).
$$

Here we follow the lecture's timing convention: after receiving $O_t$, maintain $b_t$, then execute $A_t$ and receive $O_{t+1}$ after the state transition. The initial distribution and any earlier known information are implicit in the conditioning.

Let the known transition model be $T(s'\mid s,a)$ and the observation model be $Z(o\mid s')$. Given action $a_t$, first perform the Markov prediction:

$$
\bar b_{t+1}(s')
=\sum_s T(s'\mid s,a_t)b_t(s).
$$

This simply distributes each possible state in the old belief over new states according to the environment's transitions. Then use the new observation for a Bayes correction:

$$
b_{t+1}(s')
=\frac{Z(o_{t+1}\mid s')\bar b_{t+1}(s')}
{\sum_x Z(o_{t+1}\mid x)\bar b_{t+1}(x)}.
$$

Combining the two gives

$$
b_{t+1}(s')
=\eta\,Z(o_{t+1}\mid s')
\sum_sT(s'\mid s,a_t)b_t(s),
$$

where $\eta$ is the normalizing factor that makes the total sum one. The denominator is the predictive probability of that observation given the current action and the prior history, and must be positive. If the observation also depends on the action, use $Z(o_{t+1}\mid s',a_t)$. The lecture's notation is a simplified model that omits action dependence. If rewards also reveal information about the hidden state, include them in the observations or conditioning history. We cannot receive informative rewards while claiming that an image-only belief already contains all the information.

**Supplementary example: filtering a robot's state.** The hidden states are “stable” and “slipping,” and the current belief is

$$
b_t=(0.8,0.2).
$$

After a given action, take the two-state transition matrix to be

$$
T=\begin{pmatrix}0.9&0.1\\0.4&0.6\end{pmatrix}.
$$

First predict:

$$
\bar b_{t+1}=(0.8,0.2)T=(0.8,0.2).
$$

When the sensor reports a “slip alarm,” suppose

$$
Z(\text{alarm}\mid\text{stable})=0.1,
\qquad Z(\text{alarm}\mid\text{slipping})=0.8.
$$

The unnormalized weights are $(0.08,0.16)$, and the alarm probability is $0.24$, so the updated belief is

$$
b_{t+1}=(1/3,2/3).
$$

An alarm does not make “slipping” certain, but raises its probability from $0.2$ to $2/3$. The order of transition and correction cannot be reversed, because the observation concerns the state after the transition.

In a standard POMDP with a correct model, a given initial belief, and all relevant observations from the history included, the belief can serve as a sufficient statistic for the hidden state and form a controlled belief-state process. This does not mean the raw observation sequence is automatically Markov. It means that a probability distribution compresses the useful history. What is given here is the belief-filtering update, not a complete POMDP optimal-control algorithm.

### 8.5 Two kinds of belief: an unknown parameter and an unknown current state

A Beta posterior describes “what is the value of a fixed success probability?” A POMDP belief describes “which hidden state is the system in right now?” In a static-parameter model, the former updates with new evidence. The latter must additionally predict forward according to state dynamics first. Both use Bayes, but the uncertain objects differ.

If both parameters and states are unknown, we can maintain the joint posterior $p(S_t,\Theta\mid\text{history})$. The posterior mean of a success probability cannot be treated directly as a complete belief over hidden states. By this point, Lecture 1 has connected three strands: transition models describe how the world changes, conditional expectation describes how to predict given information, and Bayes describes how new evidence changes uncertainty.

<div class="recall-block">

**Recall | Answer first, then check**

1. If two arms both have posterior mean $0.8$, do they predict the same probability of two future successes?
2. A sensor alarm supports “slipping.” Why can we not obtain the belief by simply normalizing the alarm likelihoods?

<details class="recall-answer">
<summary>Check the answers</summary>
<div class="disclosure-body">

1. Not necessarily: that probability also depends on the posterior second moment, and hence on the variance. The probability of one Bernoulli success happens to equal the mean because of a special linear relationship.
2. We must also multiply by the prior mass obtained from the transition prediction. The same observation should produce different posteriors under different old beliefs and actions.

</div>
</details>
</div>

## 9. Connecting Lecture 1: define the target, estimate it, and update information

### 9.1 Three reusable chains, not nine isolated groups of formulas

**Value and exploration.** Conditional expectation defines $V^\pi(s)$ → Monte Carlo estimates it by averaging returns → concentration inequalities control the error under their applicable conditions → UCB turns a confidence radius into an exploration bonus. This connects value estimation, finite-sample confidence, and optimistic exploration, instead of relying only on the verbal intuition that “trying more often must be better.”

**States and long-run data.** The Markov property lets the current state summarize the history → Chapman–Kolmogorov joins short-step transitions into multi-step transitions → a stationary distribution describes an invariant visitation structure → mixing time characterizes the speed of approach to that structure. Combined with conditional expectation, this chain leads to MDPs and Bellman recursions. Stationarity, fast mixing, and independent samples are three different concepts.

**Inference and belief.** Bayes obtains a posterior from a prior and likelihood → conjugate models make some updates directly computable → the posterior mean connects to MMSE, while posterior prediction eliminates unknown parameters through total probability → Thompson Sampling uses posterior uncertainty to select actions, and POMDPs maintain a belief over hidden states through prediction followed by correction.

These three chains interact in RL: action choices change state visitation and the data distribution. Data change estimates and beliefs, and the updated estimates affect the next action. Lecture 1 provides the language for analyzing this feedback process, not complete convergence or regret proofs for every algorithm.

### 9.2 Integrated exercises: calculate along the lecture's self-test themes

The following numerical problems are self-contained. They check sample confidence, matrix evolution, mixing, parameter posteriors, and state beliefs, respectively, without requiring access to the source materials.

<div class="recall-block">

**Exercise A | How confident can ten samples make us?**

Ten independent Bernoulli rewards are $1,0,1,1,0,1,0,1,1,1$. Calculate the mean and the two-sided Hoeffding confidence interval for $\delta=0.05$, and determine whether this alone guarantees an absolute error of at most $0.1$.

<details class="recall-answer">
<summary>Check the calculation and conclusion</summary>
<div class="disclosure-body">

The mean is $0.7$. Since rewards lie in $[0,1]$,

$$
r_{10}=\sqrt{\frac{\ln40}{20}}\approx0.4295.
$$

The original interval is $[0.2705,1.1295]$. Clipping it to the known range of the mean gives $[0.2705,1]$. It is wide: ten samples do not suffice for this bound to guarantee an error of $0.1$. For the same error and confidence requirements, Hoeffding gives a sufficient sample size of 185. An estimate cannot be declared reliable merely because the current mean looks plausible.

</div>
</details>
</div>

<div class="recall-block">

**Exercise B | One step, two steps, and the long run have different distributions.**

Order the weather-chain states as sunny and rainy, with $Q=\begin{pmatrix}0.8&0.2\\0.3&0.7\end{pmatrix}$, and start with a certainly sunny day. Find $\mu_1$, $\mu_2$, the stationary distribution, and the TV distance between the day-two distribution and the stationary distribution.

<details class="recall-answer">
<summary>Check the calculation and conclusion</summary>
<div class="disclosure-body">

$$
\mu_1=(0.8,0.2),\qquad
\mu_2=(0.7,0.3),\qquad
\pi=(0.6,0.4).
$$

The TV distance is $\tfrac12(|0.7-0.6|+|0.3-0.4|)=0.1$. The stationary distribution is found from $\pi Q=\pi$, whereas the finite-time distribution is found from $\mu_0Q^t$. Neither substitutes for the other.

</div>
</details>
</div>

<div class="recall-block">

**Exercise C | How different can mixing speeds be with the same stationary distribution?**

Compare two symmetric two-state chains:

$$
Q_{\mathrm{fast}}=\begin{pmatrix}0.5&0.5\\0.5&0.5\end{pmatrix},
\qquad
Q_{\mathrm{slow}}=\begin{pmatrix}0.99&0.01\\0.01&0.99\end{pmatrix}.
$$

What are their stationary distributions? For each chain, find the mixing time to reach a TV distance of at most $0.05$ from the worst initial state.

<details class="recall-answer">
<summary>Check the calculation and conclusion</summary>
<div class="disclosure-body">

Both have stationary distribution $(1/2,1/2)$. The first chain turns every initial distribution into the stationary distribution in one step, so its mixing time is 1.

For the second chain, if $p_t$ is the probability of state 1, then

$$
p_{t+1}-\frac12=0.98\left(p_t-\frac12\right),
\qquad d(t)=\frac12(0.98)^t.
$$

Therefore,

$$
t_{\mathrm{mix}}(0.05)
=\left\lceil\frac{\ln0.1}{\ln0.98}\right\rceil=114.
$$

The narrow passage between the two states forms a bottleneck. The same stationary distribution does not imply the same data efficiency. Finding the stationary distribution alone does not reveal how long we must wait.

</div>
</details>
</div>

<div class="recall-block">

**Exercise D | Distinguish parameter estimation from future prediction.**

Use a $\operatorname{Beta}(1,1)$ prior for seven successes and three failures. Find the posterior, MLE, MAP, posterior mean, probability of success on the next trial, and probability that the next two trials both succeed. Can both of the last two quantities be calculated from a single mean?

<details class="recall-answer">
<summary>Check the calculation and conclusion</summary>
<div class="disclosure-body">

The posterior is $\operatorname{Beta}(8,4)$. The MLE and MAP are both $0.7$, and the posterior mean is $2/3$. The probability of success on the next trial equals the posterior mean, but the probability of two successes requires the posterior second moment:

$$
\Pr(X_{\mathrm{new},1}=X_{\mathrm{new},2}=1\mid D)
=\frac{8\cdot9}{12\cdot13}=\frac6{13}\ne\left(\frac23\right)^2.
$$

This difference is precisely the dependence created by integrating out the shared unknown parameter. “Independent given the parameter” must not be confused with “independent given the historical data.”

</div>
</details>
</div>

<div class="recall-block">

**Exercise E | Why predict before correcting?**

The old belief over stable/slipping is $(0.8,0.2)$, and the post-action transition matrix is $T=\begin{pmatrix}0.9&0.1\\0.4&0.6\end{pmatrix}$. The alarm probabilities under the two hidden states are $0.1,0.8$, respectively. What is the belief after receiving an alarm? If the old belief is changed to $(0.2,0.8)$, does the same alarm still give the same answer?

<details class="recall-answer">
<summary>Check the calculation and conclusion</summary>
<div class="disclosure-body">

The first old belief predicts $(0.8,0.2)$. Multiplying by the observation likelihood gives $(0.08,0.16)$, and normalization yields $(1/3,2/3)$.

The second old belief first predicts $(0.5,0.5)$. Multiplying by the likelihood gives $(0.05,0.4)$, and normalization yields $(1/9,8/9)$. The same sensor result does not correspond to a unique posterior. The posterior also depends on previous information and the state evolution caused by the action.

</div>
</details>
</div>

### 9.3 Questions leading to the next lecture

We can now specify the expectation we want to estimate or the posterior we want to predict from. In high dimensions we may still have no practical way to evaluate the integral or draw a sample directly. The second lecture takes up that problem with Monte Carlo integration, importance sampling, MCMC, and models that learn to generate or transport samples. [Continue to Sampling.](/en/blog/sampling/)

### 9.4 Learning sources and further reading

This article is organized around Lecture 1 of Ziyu Shao's reinforcement learning course and its accompanying handwritten classroom explanations. It preserves the lecture's chapter order, combines repeated demonstration pages into a single discussion, and rewrites mathematical content from figures as formulas, prose, and calculable examples. Points requiring clarification, such as the conjugate pairing for the Geometric model and covariance updates with a known mean, are addressed in their respective sections. The supplementary counterexamples, occupancy distributions, spectral bounds, and integrated numerical exercises connect concepts. They are not presented as conclusions already proved in full in the original lecture.

The course's further reading includes:

- Joseph K. Blitzstein and Jessica Hwang, *Introduction to Probability*: conditional probability, conditional expectation, and methods for computing them.
- Dimitri P. Bertsekas and John N. Tsitsiklis, *Introduction to Probability*: probabilistic modeling, estimation, and stochastic processes.
- Stéphane Boucheron, Gábor Lugosi, and Pascal Massart, *Concentration Inequalities: A Nonasymptotic Theory of Independence*: systematic proofs and applicability conditions for concentration tools.
- Sheldon M. Ross, *Introduction to Probability Models*: computations for Markov chains and probabilistic models.
- Robert P. Dobrow, *Introduction to Stochastic Processes with R*: stochastic processes and computational examples.

These are bibliographic references. They do not include download links to course slides or restricted materials.
