This article works through Lecture 1, **Randomness & Confidence: Probability, Concentration, and Markov Dynamics**, keeping its eight knowledge chapters and adding a ninth that strings them together. The material follows Ziyu Shao's course at ShanghaiTech University together with the handwritten explanations that accompanied it. What follows is an independent set of notes: no slides, handwritten files, or page screenshots are reproduced or distributed.

The lecture is not about one algorithm. It is about four questions every learning algorithm keeps asking: **what is being averaged, how much can the estimate be trusted, how does the state evolve, and how does new evidence change a belief.** What makes reinforcement learning special is that the data comes from a dependent, action-driven process, and the actions themselves decide what data will exist later.

<aside class="study-tldr" aria-labelledby="tldr">
<h2 id="tldr">TL;DR</h2>
<ol>
<li><strong>A value is an expectation given information.</strong> Under squared error, the conditional expectation is also the best predictor; projection geometry explains residual orthogonality, the tower property, and the variance decomposition.</li>
<li><strong>An average needs an error guarantee.</strong> Monte Carlo turns expectations into sample means; the law of large numbers, the central limit theorem, and concentration inequalities describe limits, asymptotic shape, and finite-sample tail probabilities respectively. Independence, moment conditions, and the reward range cannot be dropped.</li>
<li><strong>State evolution and long-run behaviour are two different questions.</strong> A transition matrix gives multi-step distributions; recurrence, irreducibility, periodicity, stationarity, and mixing answer different questions. Producing one stationary vector is not the same as having converged.</li>
<li><strong>Bayesian inference keeps a whole distribution of uncertainty.</strong> The posterior supports estimation, prediction, and Thompson Sampling; a POMDP belief connects a Markov prediction step with a Bayes correction step.</li>
</ol>
<p>Concentration inequalities keep their full statements, assumptions, and usage, but not their long proofs; the remaining key reasoning and numerical examples sit in the chapters where they belong. Answers inside each Recall block start collapsed.</p>
</aside>

<nav class="article-toc" aria-label="Contents of this lecture">
<h2>Contents</h2>
<ol>
<li><a href="#section-1">Probability: random variables, Bayes, and total probability</a></li>
<li><a href="#section-2">Expectation and conditional expectation: utility, tower rule, total variance, value</a></li>
<li><a href="#section-3">LLSE, MMSE, and projection geometry</a></li>
<li><a href="#section-4">Monte Carlo and concentration: CS, Jensen, entropy, KL, tail bounds, UCB</a></li>
<li><a href="#section-5">Markov I: processes, transition matrices, multi-step computation</a></li>
<li><a href="#section-6">Markov II: classification, stationarity, reversibility, mixing</a></li>
<li><a href="#section-7">Statistical inference: MLE, MAP, posterior mean, conjugate models</a></li>
<li><a href="#section-8">Bayesian learning: posterior prediction, Thompson Sampling, POMDP</a></li>
<li><a href="#section-9">Synthesis, exercises, and further reading</a></li>
</ol>
</nav>

**Notation.** $\mathbb P$ or $\Pr$ denotes probability and $\mathbb E$ expectation; distribution vectors are written as row vectors. In reinforcement learning $\pi(a\mid s)$ is a policy, whereas $\pi_i$ in the Markov chapters is a stationary distribution, distinguished by context. Identities assume the integrability or square integrability stated nearby; "almost surely" means exceptions are allowed on a set of probability zero.

## 1. Probability: from a random world to a model you can compute with

This chapter covers logical pages 9–16 of the lecture. Probability starts from a given model and derives the behaviour of events and numbers; statistics starts from observed data and works backwards to a model, a parameter, or a belief. Reinforcement learning joins the two directions: the agent predicts and decides using a model, and its decisions change the data it will later see.

### 1.1 Sample space, events, and random variables

A single run of a random experiment has a complete outcome $\omega$, and the set of all possible outcomes is the sample space $\Omega$. An event is a set of outcomes we care about — "the grasp succeeds", say — and a probability measure $\mathbb P$ assigns each event a number. Strictly, the probability space is written $(\Omega,\mathcal F,\mathbb P)$, where $\mathcal F$ lists the events we are allowed to discuss. Probabilities are non-negative, $\mathbb P(\Omega)=1$, and countably additive over pairwise disjoint events.

A random variable is not "a letter that happens to vary": it is a measurable function that converts an outcome into a number,

$$
X:\Omega\longrightarrow\mathbb R,\qquad \omega\longmapsto X(\omega).
$$

The lecture illustrates this with the maximum of two dice throws. The raw outcome is an ordered pair, and $X$ keeps only the larger entry. If two dice are independent and fair and each shows $1,2,3,4$, all sixteen ordered pairs are equally likely. Exactly $k^2$ pairs have maximum at most $k$, so by complementing,

$$
\mathbb P(X\le k)=\frac{k^2}{16},\qquad
\mathbb P(X=k)=\frac{k^2-(k-1)^2}{16}=\frac{2k-1}{16},\quad k=1,2,3,4.
$$

The four values therefore carry probabilities $1/16,3/16,5/16,7/16$. Equal probability on the raw outcomes does not survive an arbitrary function: it is the *function* that decides which values are common.

For a discrete random variable the probability mass function is $p_X(x)=\mathbb P(X=x)$ and the distribution function is $F_X(x)=\mathbb P(X\le x)$. If the distribution has a density $f_X$, then $F_X(x)=\int_{-\infty}^{x}f_X(u)\,du$. Two things are worth separating here: a density is not a probability (it may exceed one), and probabilities come from integrating density over a set. When the pair $(X,Y)$ has a joint density, marginalizing means integrating one coordinate out,

$$
f_X(x)=\int_{-\infty}^{\infty}f_{X,Y}(x,y)\,dy .
$$

"Marginalization" is thus literally the operation "ignore that column by summing or integrating over it", which is the first place where the RL habit of marginalizing over unobserved variables appears.

### 1.2 Conditional probability and Bayes' rule

Conditional probability is a local renormalization: once we know $B$ happened, the new universe is $B$, so

$$
\mathbb P(A\mid B)=\frac{\mathbb P(A\cap B)}{\mathbb P(B)},\qquad \mathbb P(B)>0 .
$$

Everything else follows from re-reading this identity. Written as multiplication it gives the chain rule $\mathbb P(A\cap B)=\mathbb P(A\mid B)\mathbb P(B)$; applied in the other order and set equal, it gives **Bayes' rule**

$$
\mathbb P(A\mid B)=\frac{\mathbb P(B\mid A)\,\mathbb P(A)}{\mathbb P(B)} .
$$

The lecture's alarm example makes the roles concrete. A burglar alarm can *fire* or *not fire*, and the world can be *burglary* or *no burglary*. The likelihood $\mathbb P(\text{alarm}\mid\text{burglary})$ is a property of the sensor; the quantity we actually want after hearing the alarm is the posterior $\mathbb P(\text{burglary}\mid\text{alarm})$, which also needs the prior and the base rate of false alarms. A sensor that is right 99% of the time can still be followed by a low posterior probability when the event is rare. This is the single most transferable warning in the chapter, and it reappears in RL whenever a rare reward is observed.

For continuous variables the same rule is written with densities,

$$
f_{\Theta\mid X}(\theta\mid x)=\frac{f_{X\mid\Theta}(x\mid\theta)\,f_\Theta(\theta)}{f_X(x)},\qquad f_X(x)=\int f_{X\mid\Theta}(x\mid\theta)\,f_\Theta(\theta)\,d\theta ,
$$

and the denominator is exactly the marginalization of §1.1. A posterior density is a density in $\theta$ for each fixed $x$; the denominator does not depend on $\theta$, which is why it is often absorbed into a proportionality constant.

### 1.3 Total probability: averaging out a hidden grouping

If $B_1,\dots,B_n$ partition the sample space, then any event $A$ can be split along the partition,

$$
\mathbb P(A)=\sum_{i=1}^{n}\mathbb P(A\mid B_i)\,\mathbb P(B_i).
$$

The point is not the formula but the habit: a quantity that is hard to compute directly is often easy to compute *conditionally*, and the partition supplies the weights. In mixture language, the marginal law of $A$ is a weighted average of the conditional laws, with weights equal to how often each case occurs. This is the discrete ancestor of "average over the hidden variable", which becomes importance sampling and posterior predictive distributions later in the lecture.

<details class="recall-answer">
<summary>Check your answer</summary>
<div class="disclosure-body">

The dice question needs the count of raw outcomes behind each value after the mapping; the alarm question also needs the prior on burglary and the false-alarm rate, or equivalently the evidence $\mathbb P(\text{alarm})$.

</div>
</details>

### 1.4 Probability as a language for uncertainty about knowledge

Frequentist probability describes a repeatable experiment; a Bayesian probability describes a degree of belief that can be updated. The lecture stresses that these are two readings of the same calculus, not two calculi: both obey the same rules for $\mathbb P$, conditional probability, and marginalization. What differs is what the numbers mean and where the prior comes from.

This matters for RL because an agent often has both kinds of uncertainty at once. Aleatoric uncertainty is randomness in the environment that no amount of data removes — a dice roll, a noisy sensor. Epistemic uncertainty is ignorance about the model or the parameter, and it does shrink with data. A Bayesian treatment carries epistemic uncertainty explicitly as a distribution, which is why §8 can turn "act optimistically" into "sample a world from the posterior and act as if it were true".

## 2. Expectation and conditional expectation: what a value function is averaging

This chapter covers logical pages 17–40.

### 2.1 From the reward hypothesis to expected utility

The reward hypothesis says that goals can be described as the maximization of expected cumulative reward. Two things are packed in that sentence: *cumulative* (a sum over time) and *expected* (an average over randomness). The second is not decoration — maximizing a random total directly has no meaning, since a random variable is not an ordered object. What is ordered is its expectation.

The lecture justifies the expectation step with the von Neumann–Morgenstern axioms for preferences over lotteries: completeness, transitivity, continuity, and independence (substitution). Under those axioms a preference order can be represented by a utility whose expectation ranks lotteries, so "choose the lottery with the largest expected utility" is not an arbitrary convention but a consequence of the axioms. Two caveats are worth stating because they are frequently conflated: the reward hypothesis is an assumption about what goals look like, while vNM is a representation theorem about preferences over lotteries. The former can fail for goals that are not sums of per-step rewards; the latter can fail when preferences violate independence, as in the Allais paradox.

### 2.2 Expectation, linearity, and the return

For a discrete variable $X$ with mass $p_X$, and a continuous one with density $f_X$,

$$
\mathbb E[X]=\sum_x x\,p_X(x),\qquad \mathbb E[X]=\int_{-\infty}^{\infty}x\,f_X(x)\,dx ,
$$

and for a function $g$ of the variable, $\mathbb E[g(X)]=\sum_x g(x)p_X(x)$ or $\int g(x)f_X(x)\,dx$. Expectation is linear whether or not the variables are independent,

$$
\mathbb E[aX+bY+c]=a\,\mathbb E[X]+b\,\mathbb E[Y]+c ,
$$

and this is the reason a discounted return can be decomposed term by term. With $\gamma\in[0,1)$ and rewards $R_{t+1},R_{t+2},\dots$,

$$
G_t=\sum_{k=0}^{\infty}\gamma^{k}R_{t+k+1},\qquad
\mathbb E[G_t]=\sum_{k=0}^{\infty}\gamma^{k}\,\mathbb E[R_{t+k+1}],
$$

where the interchange of sum and expectation needs the series to converge absolutely, guaranteed here when rewards are bounded: $|R|\le R_{\max}$ gives $|G_t|\le R_{\max}/(1-\gamma)$. Linearity alone does *not* say $\mathbb E[XY]=\mathbb E[X]\mathbb E[Y]$; that needs independence or uncorrelatedness, and the gap between the two is exactly the covariance.

### 2.3 Conditional expectation given an event

Conditioning on an event $B$ with $\mathbb P(B)>0$ replaces the distribution by the conditional one,

$$
\mathbb E[X\mid B]=\frac{\mathbb E[X\mathbf 1_B]}{\mathbb P(B)}=\sum_x x\,\mathbb P(X=x\mid B).
$$

This is a plain number: the average of $X$ among the runs in which $B$ happened. It answers "what should I expect, given that this particular thing is true". It cannot answer "what should I expect, given how much I know so far", because as information accumulates the answer changes — that requires conditioning on a random variable instead.

### 2.4 Conditioning on a random variable: the answer is itself a random variable

$\mathbb E[X\mid Y]$ is not a number but a function of $Y$: for each realized value $y$ we compute $\mathbb E[X\mid Y=y]$, and the result varies with $y$. Formally it is the unique (almost surely) $\sigma(Y)$-measurable random variable $Z$ satisfying

$$
\mathbb E[Z\,\mathbf 1_{\{Y\in A\}}]=\mathbb E[X\,\mathbf 1_{\{Y\in A\}}]\quad\text{for every measurable } A .
$$

The intuition is "coarsening": $\mathbb E[X\mid Y]$ is the best summary of $X$ you can give when the only thing you are allowed to look at is $Y$. In an MDP, $\mathbb E[G_t\mid S_t=s]$ is a number (the value of a state), while $\mathbb E[G_t\mid S_t]$ is a random variable whose randomness comes entirely from the state. Confusing the two produces the classic error of treating a value function as if it were independent of the state it was evaluated at.

### 2.5 Properties and the tower property

Conditional expectation inherits linearity, monotonicity, and the rule "take out what is known": for a function $h$ of $Y$,

$$
\mathbb E[h(Y)X\mid Y]=h(Y)\,\mathbb E[X\mid Y].
$$

The **tower property** (law of total expectation) says that averaging a conditional average recovers the unconditional one,

$$
\mathbb E\big[\mathbb E[X\mid Y]\big]=\mathbb E[X],\qquad
\mathbb E\big[\mathbb E[X\mid Y,Z]\mid Y\big]=\mathbb E[X\mid Y].
$$

The second form is the one used constantly in RL: averaging over the next state first and then over the current state is the same as averaging over both at once. It is what makes the Bellman expectation equation legitimate, since the one-step lookahead already contains the whole future average inside $V(S_{t+1})$.

### 2.6 Conditional variance and total variance

Define $\operatorname{Var}(X\mid Y)=\mathbb E[(X-\mathbb E[X\mid Y])^2\mid Y]$, again a random variable. Then

$$
\operatorname{Var}(X)=\mathbb E\big[\operatorname{Var}(X\mid Y)\big]+\operatorname{Var}\big(\mathbb E[X\mid Y]\big).
$$

Read it as "total spread = spread left inside each group, averaged + spread of the group means". A dataset can be noisy because each group is noisy, or because the groups differ from each other, and the two contributions add. In RL this decomposition separates the variance of returns *within* a state (environment stochasticity, which no better estimate of the value can remove) from the variance *across* states (which a finer representation can capture).

<details class="recall-answer">
<summary>Check your answer</summary>
<div class="disclosure-body">

The first is a random variable that takes the value 5 or 1; the second is the number 5. The spread can also come mainly from groups having different means, which is the second term of the total variance formula.

</div>
</details>

### 2.7 Conditional expectation in RL: values and the one-step decomposition

Pick a fixed policy $\pi$. Then

$$
V^{\pi}(s)=\mathbb E_{\pi}\!\left[G_t\mid S_t=s\right],\qquad
Q^{\pi}(s,a)=\mathbb E_{\pi}\!\left[G_t\mid S_t=s,A_t=a\right],
$$

and the one-step decomposition follows from linearity plus the tower property:

$$
V^{\pi}(s)=\sum_{a}\pi(a\mid s)\sum_{s'}p(s'\mid s,a)\Big[r(s,a,s')+\gamma V^{\pi}(s')\Big].
$$

Nothing in this derivation needs independence across time; it needs only that the inner conditional expectation is well defined, which the Markov property supplies. That is the precise sense in which "a value is an expectation": it is an average over everything the future might do, taken after fixing the present.

<details class="recall-answer">
<summary>Check your answer</summary>
<div class="disclosure-body">

Copying the value keeps the mean equal to that one coin outcome and can therefore stay unbiased, but the variance is still $1/4$. The second question requires re-checking the known reward range, the independence assumption, the stability of the distribution, and the confidence requirement.

</div>
</details>

## 3. LLSE, MMSE, and projections: why conditional expectation is the best squared-error predictor

This chapter covers logical pages 41–53.

### 3.1 LLSE: when only affine predictors are allowed

Suppose we predict $Y$ from $X$ and restrict ourselves to affine functions $\hat Y=a+bX$. Minimizing $\mathbb E[(Y-a-bX)^2]$ gives the linear least-squares estimator

$$
b^{*}=\frac{\operatorname{Cov}(X,Y)}{\operatorname{Var}(X)},\qquad a^{*}=\mathbb E[Y]-b^{*}\mathbb E[X],
$$

so that the optimal affine predictor is $\mathbb E[Y]+\frac{\operatorname{Cov}(X,Y)}{\operatorname{Var}(X)}(X-\mathbb E[X])$ and the residual mean squared error is $\sigma_Y^2(1-\rho_{XY}^2)$. Three readings are useful: the slope is a ratio of covariance to variance (a "second-moment regression"), the error shrinks by exactly the squared correlation, and perfect correlation makes the error zero while zero correlation makes the best affine predictor the constant $\mathbb E[Y]$.

For vectors the same computation in matrix form gives

$$
\hat Y=\mathbb E[Y]+\Sigma_{YX}\Sigma_{XX}^{-1}(X-\mathbb E[X]),
$$

which requires $\Sigma_{XX}$ invertible. When it is not, the pseudo-inverse or a restriction to the range gives the same fitted values; only the coefficient representation becomes non-unique.

### 3.2 MMSE: all square-integrable functions of $X$ are allowed

Drop the affine restriction and minimize $\mathbb E[(Y-g(X))^2]$ over all square-integrable $g$. The minimizer is the conditional expectation,

$$
g^{*}(X)=\mathbb E[Y\mid X].
$$

The proof is a one-line orthogonality argument: for any competitor $g$, the error decomposes as $\mathbb E[(Y-g)^2]=\mathbb E[(Y-\mathbb E[Y\mid X])^2]+\mathbb E[(\mathbb E[Y\mid X]-g(X))^2]$, the cross term vanishing because $\mathbb E[Y-\mathbb E[Y\mid X]\mid X]=0$. LLSE and MMSE therefore coincide exactly when the conditional mean happens to be affine in $X$, and generally LLSE is the best *linear* approximation, with $\operatorname{Var}(\mathbb E[Y\mid X])\ge \operatorname{Var}(\text{LLSE})$.

### 3.3 Geometry in Hilbert space: inner product, distance, orthogonality, nested projections

Treat square-integrable random variables as vectors with inner product $\langle U,V\rangle=\mathbb E[UV]$, norm $\|U\|_2=\sqrt{\mathbb E[U^2]}$, and distance $\|U-V\|_2$. Then

* $\operatorname{Cov}(X,Y)=\langle X-\mathbb E X,\,Y-\mathbb E Y\rangle$;
* "uncorrelated" means orthogonal *after centring*;
* $\mathbb E[Y\mid X]$ is the orthogonal projection of $Y$ onto the closed subspace of all functions of $X$;
* LLSE is the projection onto the smaller subspace of affine functions.

Because the spaces are nested, the projections compose: projecting onto the smaller space directly equals projecting onto the larger then onto the smaller. That is the geometric content of the tower property.

### 3.4 The orthogonality property and its converse

The defining property of $\hat Y=\mathbb E[Y\mid X]$ is that the residual is orthogonal to every function of $X$:

$$
\mathbb E\big[(Y-\hat Y)\,h(X)\big]=0\quad\text{for all square-integrable } h .
$$

The converse is what makes this a characterization rather than merely a property: if a function-of-$X$ variable $\hat Y$ has this orthogonality for all $h$, then $\hat Y=\mathbb E[Y\mid X]$ almost surely. Two warnings, both worth memorizing. Orthogonality to $X$ alone (not to all functions of $X$) characterizes LLSE, not MMSE. And zero variance is a special case: if $Y$ is a function of $X$ then the residual is zero, so orthogonality holds trivially.

<details class="recall-answer">
<summary>Check your answer</summary>
<div class="disclosure-body">

The symmetric example $Y=X^2$ with symmetric $X$ refutes the first inference: zero correlation with $X$ does not mean conditional mean equal to a constant. The second question needs the orthogonality checked against *all* square-integrable functions of $X$, or the equivalent conditional-mean characterization, not just one linear direction.

</div>
</details>

### 3.5 When the pair is jointly Gaussian, LLSE equals MMSE

If $(X,Y)$ is jointly Gaussian, then $\mathbb E[Y\mid X]$ is affine in $X$:

$$
\mathbb E[Y\mid X=x]=\mu_Y+\Sigma_{YX}\Sigma_{XX}^{-1}(x-\mu_X),
\qquad
\operatorname{Var}(Y\mid X=x)=\Sigma_{YY}-\Sigma_{YX}\Sigma_{XX}^{-1}\Sigma_{XY},
$$

and the conditional variance does not depend on $x$. Hence the best linear predictor is the best predictor, and the conditional distribution is Gaussian with that mean and covariance. This is precisely why the Kalman filter is exact for linear-Gaussian models and only approximate otherwise. It is a property of the joint law, not a general truth: for non-Gaussian pairs the conditional mean can be nonlinear no matter how good the linear fit looks.

## 4. Monte Carlo, concentration inequalities, and finite-sample confidence

This chapter covers logical pages 54–92. It is the technical heart of the lecture: the first three chapters say what to estimate, and this one says how large the error of an estimate can be.

### 4.1 Monte Carlo: replace an expectation by an empirical average

If $X_1,\dots,X_n$ are i.i.d. copies of $X$ with $\mathbb E[X^2]<\infty$, the Monte Carlo estimator is

$$
\hat\mu_n=\frac1n\sum_{i=1}^{n}X_i,\qquad
\mathbb E[\hat\mu_n]=\mu,\qquad
\operatorname{Var}(\hat\mu_n)=\frac{\sigma^2}{n}.
$$

It is unbiased, and its variance shrinks at rate $1/n$ — the square root of the number of samples, not the number of samples, sets the error scale. In an episodic MDP the same recipe gives the first-visit return estimator: run the policy, collect returns from state $s$, average them. The sample mean here is a random variable whose own randomness comes from every source in the environment; §4.2 through §4.12 quantify how far it can stray.

### 4.2 What LLN, CLT, and concentration inequalities each answer

The law of large numbers says $\hat\mu_n\to\mu$ as $n\to\infty$ (in probability or almost surely, depending on the version). It is a statement about the limit and says nothing about how fast. The central limit theorem says

$$
\sqrt n\,(\hat\mu_n-\mu)\ \xrightarrow{d}\ \mathcal N(0,\sigma^2)
$$

when the variance is finite and positive, so for large $n$ the error is approximately Gaussian with standard deviation $\sigma/\sqrt n$; the CLT is asymptotic and gives no guaranteed bound at any fixed $n$. Concentration inequalities give finite-sample tail bounds of the form $\mathbb P(|\hat\mu_n-\mu|\ge\epsilon)\le \delta(\epsilon,n)$, valid for every $n$ but typically loose. All three need independence or something close to it; that requirement is where practice departs from theory most often.

### 4.3 Cauchy–Schwarz: controlling inner products and correlation

$$
\big|\mathbb E[XY]\big|\le\sqrt{\mathbb E[X^2]\,\mathbb E[Y^2]},\qquad
|\operatorname{Cov}(X,Y)|\le\sigma_X\sigma_Y,\qquad
|\rho_{XY}|\le 1 ,
$$

with equality in the first iff $X$ and $Y$ are linearly dependent almost surely. This is the inequality behind "$|\rho|\le1$", behind the shrinkage factor $1-\rho^2$ in §3.1, and behind many variance-reduction arguments: if you can bound a correlation, you can bound how much a control variate can help.

### 4.4 Jensen: transform then average versus average then transform

For a convex $\varphi$,

$$
\varphi(\mathbb E[X])\le\mathbb E[\varphi(X)],
$$

with equality only when $X$ is degenerate or $\varphi$ is affine on the relevant range. Jensen is the reason $\mathbb E[X^2]\ge(\mathbb E X)^2$, i.e. $\operatorname{Var}(X)\ge 0$, and the reason $\log\mathbb E[X]\ge\mathbb E[\log X]$, which is the engine of the entropy and KL results below.

### 4.5 Entropy and maximum entropy: why the uniform distribution is least informative

For a finite distribution $p$,

$$
H(p)=-\sum_i p_i\log p_i ,
$$

with $0\log 0=0$ by continuity. Entropy is not "disorder"; it is the expected surprise $-\mathbb E[\log p(X)]$, i.e. the number of bits needed on average to describe a draw. Maximizing it subject to $\sum_i p_i=1$ gives the uniform distribution, and this is exactly where Jensen earns its keep: $\log$ is concave, so averaging $\log p_i$ can never exceed the log of the average, and equality forces all $p_i$ equal.

### 4.6 KL divergence: the extra cost of describing data with the wrong distribution

$$
D_{\mathrm{KL}}(p\,\|\,q)=\sum_i p_i\log\frac{p_i}{q_i}\ \ge\ 0,
$$

with $D_{\mathrm{KL}}(p\|q)=0$ iff $p=q$. The inequality is Jensen applied to the concave log, and the convention is that $p_i>0$ and $q_i=0$ makes the divergence $+\infty$ — you cannot describe an outcome with a distribution that forbids it. KL is not symmetric and does not satisfy the triangle inequality, so it is a divergence and not a distance; it is, however, the amount by which the average code length grows when $q$ is used to code draws from $p$.

### 4.7 Markov and Chebyshev: what first and second moments can promise

$$
\mathbb P(X\ge a)\le\frac{\mathbb E[X]}{a}\quad (X\ge 0),\qquad
\mathbb P\big(|X-\mu|\ge\epsilon\big)\le\frac{\sigma^2}{\epsilon^2}.
$$

Markov needs only non-negativity and a first moment; Chebyshev follows from Markov applied to $(X-\mu)^2$ and needs a finite variance. Both are distribution-free, both are usually loose, and both are the fallback when nothing else is available. For $\hat\mu_n$ of i.i.d. samples, Chebyshev gives $\mathbb P(|\hat\mu_n-\mu|\ge\epsilon)\le\sigma^2/(n\epsilon^2)$, which already shows the $1/n$ scaling but demands an unrealistically large $n$ to reach small $\epsilon$.

### 4.8 Chernoff: bounding tails through the exponential moment

For any $t>0$,

$$
\mathbb P(X\ge a)\le e^{-ta}\,\mathbb E\big[e^{tX}\big],
$$

because $e^{tX}$ is increasing and Markov applies. Optimizing over $t$ gives the Chernoff bound. The mechanism is worth remembering in words: multiplying by an exponential *tilts* the distribution, and the moment generating function measures how much mass sits in the upper tail. The bound is only as good as the MGF is finite near zero.

### 4.9 Hoeffding's lemma, sub-Gaussianity, and the Taylor tool

**Hoeffding's lemma.** If $\mathbb E[X]=0$ and $a\le X\le b$ almost surely, then for all $t\in\mathbb R$

$$
\mathbb E\big[e^{tX}\big]\le \exp\!\left(\frac{t^2(b-a)^2}{8}\right).
$$

The proof idea is short and reusable: $\log\mathbb E[e^{tX}]$ as a function of $t$ is convex with value $0$ and derivative $0$ at $t=0$, and the second derivative is a variance, which for a variable confined to $[a,b]$ is at most $(b-a)^2/4$, so convexity plus that variance bound caps the growth at $t^2(b-a)^2/8$. A bounded variable is therefore sub-Gaussian with parameter $\sigma=(b-a)/2$, and a sub-Gaussian variable satisfies $\mathbb E[e^{tX}]\le e^{\sigma^2t^2/2}$, which is the only property of Gaussian tails we need. The lecture's Taylor exercise builds the same intuition from the other end: $e^{x}\le 1+x+\frac{x^2}{2}e^{|x|}$-type expansions explain why boundedness buys an exponential moment.

### 4.10 Hoeffding's inequality: exponential concentration for independent bounded samples

If $X_1,\dots,X_n$ are independent with $\mathbb E[X_i]=\mu_i$ and $a_i\le X_i\le b_i$, then for every $\epsilon>0$

$$
\mathbb P\big(\bar X-\bar\mu\ge\epsilon\big)\le\exp\!\left(-\frac{2n^2\epsilon^2}{\sum_i (b_i-a_i)^2}\right),
$$

and symmetrically for the lower tail. With a common range $b-a$, this becomes $\exp(-2n\epsilon^2/(b-a)^2)$ for each tail. The assumptions are the ones people forget: independence, and *each* variable's own range — using the common range when one variable is far more spread out silently loses power. Neither identical distributions nor a finite variance is required.

### 4.11 Turning tail bounds into confidence radii and sample sizes

Set the tail probability to $\delta$ and solve for $\epsilon$:

$$
\epsilon=\sqrt{\frac{(b-a)^2\ln(1/\delta)}{2n}},\qquad
n\ge\frac{(b-a)^2\ln(1/\delta)}{2\epsilon^2}.
$$

With rewards in $[0,1]$, $\epsilon=0.1$ and $\delta=0.05$ require $n\ge185$ — a number worth remembering as an antidote to "the average looked stable after ten runs". The bound is conservative, but its logic is the valuable part: an error claim is only meaningful as a pair (radius, confidence), and the sample size is what ties them together.

<details class="recall-answer">
<summary>Check the computation and the conclusion</summary>
<div class="disclosure-body">

The mean is $0.7$. Since rewards lie in $[0,1]$,

$$
r_{10}=\sqrt{\frac{\ln40}{20}}\approx0.4295,
$$

so the raw interval is $[0.2705,1.1295]$, truncated to $[0.2705,1]$ because the mean cannot exceed one. That interval is wide: ten samples do not let this bound guarantee an error of $0.1$. Hoeffding's sufficient sample size for the same requirement is $185$, and no amount of optimism about the current mean changes that.

</div>
</details>

### 4.12 UCB preview: turning uncertainty into an exploration bonus

If each arm's rewards are i.i.d. from a fixed distribution supported on $[0,1]$, Hoeffding's bound applied to the arm's empirical mean gives, with probability at least $1-\delta$,

$$
\big|\hat\mu_a-\mu_a\big|\le\sqrt{\frac{\ln(2/\delta)}{2n_a}},
$$

so an upper confidence bound is $\hat\mu_a+\sqrt{\ln(2/\delta)/(2n_a)}$ and acting greedily on it yields the UCB rule "explore the arm whose *optimistic* estimate is best". Three cautions: the number of pulls $n_a$ is random, so the bound must hold simultaneously over arms and over time, which is why practical UCB uses a union bound or a anytime-valid refinement; the guarantee is about the gap to the best arm, not about per-round regret being small; and the whole argument collapses if rewards are unbounded or strongly dependent across pulls.

## 5. Markov Dynamics I: from random variables to stochastic processes

This chapter covers logical pages 93–120.

### 5.1 A stochastic process has two dimensions: time and state space

A stochastic process is a family $\{X_t\}$ indexed by time, where each $X_t$ takes values in a state space $\mathcal S$. The state space can be discrete or continuous, the time index discrete or continuous, and the four combinations behave very differently. A Markov chain is the discrete-time, discrete-state case; a diffusion is the continuous-time, continuous-state case. Everything in this lecture lives in the first cell, but the vocabulary transfers.

### 5.2 The Markov property and time homogeneity are different assumptions

The Markov property says the future depends on the past only through the present:

$$
\Pr(X_{t+1}=j\mid X_t=i,X_{t-1}=i_{t-1},\dots,X_0=i_0)=\Pr(X_{t+1}=j\mid X_t=i).
$$

Time homogeneity additionally says this probability does not depend on $t$. The property bounds *how much history* matters; homogeneity bounds *whether the clock* matters. A chain can be Markov but not homogeneous (e.g. a transition rule that changes with the season), and a homogeneous chain can fail the Markov property if the state is a poor summary. In RL, the state is *defined* to be whatever makes the Markov property hold, and the "Markov decision process" name is precisely the demand that $s$ contain everything relevant.

### 5.3 The transition matrix: each row is one conditional distribution

For a finite chain, $q_{ij}=\Pr(X_{t+1}=j\mid X_t=i)$, and $Q=(q_{ij})$ satisfies $q_{ij}\ge0$ and $\sum_j q_{ij}=1$ — a row-stochastic matrix. The $i$-th row is the next-step distribution starting from $i$, and the row-sum-one condition is total probability, not a technicality. Distribution vectors are row vectors in this convention, and the update of the law is $\mu_{t+1}=\mu_t Q$.

### 5.4 Multi-step transitions and the Chapman–Kolmogorov equation

The two-step transition probabilities sum over the intermediate state,

$$
q_{ij}^{(2)}=\sum_k \Pr(X_2=j\mid X_1=k)\Pr(X_1=k\mid X_0=i)=\sum_k q_{ik}q_{kj}=(Q^2)_{ij},
$$

and by induction $Q^{(m)}=Q^m$. This is why matrix powers, and not matrix inverses, drive Markov computations: the evolution is a repeated multiplication, and the long-run questions of §6 are questions about the powers of $Q$.

### 5.5 A three-state worked example: one-step, path, two-step, and conditional expectation

Take the chain on $\{1,2,3\}$ with

$$
Q=\begin{pmatrix}0.8&0.2&0\\0.2&0.6&0.2\\0&0.2&0.8\end{pmatrix}.
$$

Then $\Pr(X_3=1\mid X_2=1)=q_{11}=0.8$ and $\Pr(X_4=3\mid X_3=2)=q_{23}=0.2$. A path probability multiplies along the path, $\Pr(X_3=2,X_4=3\mid X_2=1)=q_{12}q_{23}=0.2\times0.2=0.04$. The two-step law from state 1 is the first row of $Q^2$,

$$
(0.68,\ 0.28,\ 0.04),
$$

and a conditional expectation of a function $f$ of the next state is $\sum_j q_{ij}f(j)$ — a matrix–vector product, which is the finite-state form of $\mathbb E[f(S_{t+1})\mid S_t=i]$.

<details class="recall-answer">
<summary>Check your answer</summary>
<div class="disclosure-body">

1. The first is $q_{21}q_{12}=0.2\times0.5=0.1$ for a particular chain; more importantly, if the initial time counts as "already hit", the second probability is one, so the time window of the hitting event must be fixed before any number can be given.
2. Yes. The Markov property constrains dependence on history; homogeneity constrains dependence on absolute time; neither implies the other.

</div>
</details>

### 5.6 How a fixed policy induces a state chain

Fix $\pi$. Then $\Pr(S_{t+1}=s'\mid S_t=s)=\sum_a \pi(a\mid s)\,p(s'\mid s,a)$, which is a transition matrix on the state space alone. This single line explains why policy evaluation is a Markov-chain question: once the policy is fixed there is no decision left, only dynamics. Two different policies induce two different matrices on the same state space, and their stationary behaviour may differ in every way — in the distribution they converge to, and in how fast they converge.

## 6. Markov Dynamics II: state classification, stationarity, and mixing

This chapter covers logical pages 121–148.

### 6.1 Reachability, communication, classes, and irreducibility

State $j$ is reachable from $i$ if $q_{ij}^{(n)}>0$ for some $n\ge1$; $i$ and $j$ communicate if each is reachable from the other. Communication is an equivalence relation, so the state space splits into **communicating classes**. The chain is **irreducible** if there is one class covering everything. Irreducibility is the assumption behind most convergence guarantees, and it can fail in RL when a policy never leaves some region.

### 6.2 Recurrence and transience: do you come back?

State $i$ is recurrent if the expected number of returns to $i$ is infinite, equivalently if the return probability is one; it is transient if that probability is less than one. A finite irreducible chain is recurrent. This matters for whether a long run of a policy visits a state often enough to estimate its value: transience means the visit count stays bounded in expectation, so no estimator can be consistent.

### 6.3 Periodicity: are return times locked to a beat?

The period of $i$ is the greatest common divisor of $\{n\ge1: q_{ii}^{(n)}>0\}$. A state is aperiodic if that gcd is one, and a chain is aperiodic if all states are. A two-state swap chain is periodic with period 2: the distribution oscillates forever and never converges to a point mass limit, even though it has a stationary distribution. Periodicity is the reason "the stationary distribution exists" and "the law converges" are separate statements.

### 6.4 A stationary distribution is a fixed point of the law, not a stopped path

$\pi$ is stationary if $\pi Q=\pi$ with $\pi_i\ge0$ and $\sum_i\pi_i=1$. This is a statement about the distribution, not about individual trajectories: the chain keeps moving under a stationary law, and each single trajectory keeps changing state. An irreducible aperiodic finite chain has a unique stationary distribution and converges to it from any start. Convergence is in total variation, which is what §6.6 quantifies.

### 6.5 Detailed balance and reversibility

A distribution $\pi$ satisfies detailed balance if $\pi_i q_{ij}=\pi_j q_{ji}$ for all $i,j$. Summing over $i$ gives $\pi Q=\pi$, so detailed balance implies stationarity; the converse fails in general. A chain satisfying detailed balance is reversible: the law of a path run forwards equals the law of the path run backwards, and this is the property that makes MCMC easy to construct — you design a proposal and then correct it so that the target distribution balances.

### 6.6 Total variation distance and mixing time

$$
d_{\mathrm{TV}}(\mu,\nu)=\tfrac12\sum_i|\mu_i-\nu_i|=\max_{A}|\mu(A)-\nu(A)| ,
$$

and the mixing time is the first $t$ with $d_{\mathrm{TV}}(\mu_0Q^t,\pi)\le\varepsilon$. Reading it twice is worth the effort: TV is the largest disagreement between the two distributions about any event, so "the chain is mixed" means "no event's probability is off by more than $\varepsilon$", which is exactly what an agent needs before trusting an estimate drawn from the chain.

### 6.7 Bottlenecks, conductance, and the spectral gap

Define the conductance of a chain $\pi$ as $\Phi=\min_{S:\,0<\pi(S)\le\tfrac12}\frac{\sum_{i\in S,j\notin S}\pi_i q_{ij}}{\pi(S)}$. It is the smallest flow across any cut, normalized by the smaller side's mass. Bottlenecks make $\Phi$ small, and small $\Phi$ implies slow mixing, with the spectral gap $\lambda_2$ of the (symmetrized) chain ordering as $t_{\mathrm{mix}}$ is roughly $\log(1/\pi_{\min})/\lambda_2$. The 0.98-versus-0.5 example makes this concrete: two chains with the same stationary distribution $(1/2,1/2)$ mix in 1 step and in 114 steps respectively at tolerance 0.05.

### 6.8 RL connection: discounted occupancy is not a stationary distribution

The discounted state occupancy $d^{\pi}(s)=\sum_t \gamma^t \Pr(S_t=s\mid S_0\sim\mu_0)$ measures how much a discounted reward weighting sees state $s$; it is not the stationary distribution, depends on $\gamma$ and on the start distribution, and does not carry the normalization of a stationary law. Even for a fixed policy, "which states matter for the objective" and "which states does the chain settle on" are different questions, and confusing them is a common source of off-by-a-factor errors in gradient derivations.

<details class="recall-answer">
<summary>Check your answer</summary>
<div class="disclosure-body">

1. An irreducible deterministic two-state swap chain is a counterexample; periodicity makes the point mass oscillate. Uniqueness of the stationary distribution and pointwise convergence are different statements.
2. Not in general: the stationary mass is proportional to degree. A symmetric edge set does not make the normalized transition matrix symmetric.

</div>
</details>

## 7. Statistical inference: inferring an unknown parameter from observations

This chapter covers logical pages 149–170.

### 7.1 Parametric models, frequentist and Bayesian readings

A parametric model says the data came from $p(x\mid\theta)$ for some $\theta\in\Theta$. The frequentist treats $\theta$ as fixed and unknown, and asks for guarantees over repeated experiments; the Bayesian puts a prior $p(\theta)$ on it and reports a distribution. Neither direction invalidates the other, and in RL both appear: a confidence bound is frequentist, a Thompson Sampling posterior is Bayesian.

### 7.2 Likelihood and the MLE

For i.i.d. data $x_1,\dots,x_n$ the likelihood is $L(\theta)=\prod_i p(x_i\mid\theta)$ and the MLE is $\arg\max_\theta L(\theta)$, usually found through $\ell(\theta)=\log L(\theta)$ because products become sums. Two habits matter: check the parameter space and boundary cases (if successes are 1 in 10 trials, the MLE of $\theta$ is on the boundary), and remember that a likelihood is not a probability in $\theta$ — it is a function whose scale is set by the data.

### 7.3 Bayes updating: the full output is a posterior distribution

$$
p(\theta\mid D)=\frac{p(D\mid\theta)\,p(\theta)}{\int p(D\mid\theta)p(\theta)\,d\theta}.
$$

The denominator is a constant in $\theta$, so the update is usually written as $p(\theta\mid D)\propto p(D\mid\theta)p(\theta)$ and computed by recognizing the right-hand side as a known family. Nothing about the posterior requires the prior to be "correct" in a verificationist sense; but a prior with a point mass where the truth is not leads to a posterior that never moves, and a tail so thin that a surprising observation has probability zero produces a contradiction.

### 7.4 MAP, posterior mean, and the loss function

Three summary statistics answer three different optimization questions: the MAP is the mode, the posterior mean minimizes squared error, the posterior median minimizes absolute error. For Beta priors the MAP is $\frac{a-1}{a+b-2}$ while the mean is $\frac{a}{a+b}$, so they differ exactly where the prior is not richly informative. The lecture stresses the choice of loss because the "best estimate" is undefined without one.

### 7.5 The Beta distribution: shape, mean, and variance

For parameters $a,b>0$,

$$
\mathbb E[\Theta]=\frac{a}{a+b},\qquad
\operatorname{Var}(\Theta)=\frac{ab}{(a+b)^2(a+b+1)},
$$

and the mode is $\frac{a-1}{a+b-2}$ when $a,b>1$. Larger $a+b$ means a sharper density, larger $a/(a+b)$ means mass shifted right; the variance shrinks like $1/(a+b)$ at fixed mean, which is why more pseudo-observations make a prior more confident.

### 7.6 Beta–Binomial conjugacy: count the denominator too

With $\Theta\sim\operatorname{Beta}(a,b)$ and $S\mid\Theta\sim\operatorname{Binomial}(n,\Theta)$,

$$
\Theta\mid S=s\sim\operatorname{Beta}(a+s,\,b+n-s),\qquad
\mathbb E[\Theta\mid S=s]=\frac{a+s}{a+b+n}.
$$

The posterior mean is not the observed frequency $s/n$ unless the prior's mean equals the frequency; it is a weighted average of prior mean and data. This is the cleanest demonstration of shrinkage, and it is exactly the Bayesian UCB of §8.3.

<details class="recall-answer">
<summary>Check your answer</summary>
<div class="disclosure-body">

1. Allowing the boundary, the MLE is $1$, the posterior is $\operatorname{Beta}(11,1)$, its density peaks at the boundary, and the posterior mean is $11/12$. With an open parameter space one should instead say the first two are attained as suprema at the boundary, not at an interior maximum.
2. Three successes and three failures give a $\operatorname{Beta}(5,5)$ posterior. Waiting times must be counted as starting from one, otherwise the final success of each run gets subtracted twice.

</div>
</details>

### 7.7 Conjugate models for discrete likelihoods

A conjugate family is one that the posterior stays inside, which is what makes the update a rule for parameters rather than an integration problem. For a single categorical observation with a Dirichlet prior, counts are simply added. For $n$ binary trials, the Beta is the Dirichlet restricted to two categories. For a Poisson likelihood $X\mid\Lambda\sim\text{Poisson}(\lambda)$ with a Gamma prior, the posterior stays Gamma with the shape increased by the sum of counts.

| Likelihood | Conjugate prior | Posterior parameters |
| --- | --- | --- |
| Bernoulli / Binomial | Beta $(\alpha,\beta)$ | $(\alpha+\text{successes},\ \beta+\text{failures})$ |
| Categorical / Multinomial | Dirichlet $\alpha$ | $\alpha+\text{counts}$ |
| Poisson | Gamma $(a,\beta)$ | $a+\sum x_i,\ \beta+n$ |
| Geometric (trials as data) | Beta $(\alpha,\beta)$ | $(a+n,\ b+\sum x_i-n)$ |
| Negative binomial | Beta $(\alpha,\beta)$ | $(a+rn,\ b+\sum x_i)$ |

The table is easy to get wrong at the boundaries: the geometric and negative-binomial rows count *failures before* successes differently, so the same data give different posteriors under the two parameterizations. That is the point of listing them together — the pair "likelihood + parameterization" is the object, not the name of the family.

### 7.8 Conjugate models for continuous likelihoods: parameterizations spelled out

| Likelihood | Conjugate prior | Posterior parameters |
| --- | --- | --- |
| Normal, known variance, mean unknown | Normal | precision adds, means weighted by precision |
| Normal, known mean, variance unknown | Inverse-Gamma | shape and rate shift by counts and squared deviations |
| Normal, mean and variance unknown | Normal–Inverse-Gamma | joint update of the two blocks |
| Multivariate normal, known covariance | Normal | matrix precision adds |
| Multivariate normal, covariance unknown | Inverse-Wishart | scatter matrix update |
| Exponential | Gamma | shape adds counts, rate adds totals |
| Uniform, upper endpoint unknown | Pareto | max and count drive the update |

One correction worth recording: the Gamma–Geometric row is often printed with the rate and shape swapped, and the inverse-Wishart with a known-mean update sometimes carries a scatter term for the mean, which should not be there. These are transcription errors in widely copied tables, not new mathematics.

## 8. Bayesian learning: keep the uncertainty, then predict and act

This chapter covers logical pages 171–178.

### 8.1 Sequential updating and a Beta–Bernoulli worked example

Posteriors compose: updating on data $D_1$ and then on $D_2$ equals updating once on $D_1\cup D_2$. With $\Theta\sim\operatorname{Beta}(2,2)$ and observations success, success, failure,

$$
\Theta\mid D\sim\operatorname{Beta}(4,3),\qquad \mathbb E[\Theta\mid D]=\frac{4}{7}.
$$

The fact that the order of observations does not matter, but the *pairing* of a prior with a likelihood does, is the reason the conjugate tables in §7 are useful.

### 8.2 Posterior prediction: predict the data, not a parameter point

$$
\Pr(X_{\text{new}}=1\mid D)=\int \theta\,p(\theta\mid D)\,d\theta=\mathbb E[\Theta\mid D]=\frac{a+s}{a+b+s+f}.
$$

The equality for a Bernoulli observation is a coincidence of the linearity of the mean, and it is worth seeing why: the predictive mean equals the posterior mean of $\theta$ because the event's indicator has mean $\theta$. For a *pair* of future observations the second moment enters,

$$
\Pr(X_{\text{new},1}=X_{\text{new},2}=1\mid D)=\mathbb E[\Theta^2\mid D]=\frac{A(A+1)}{(A+B)(A+B+1)},
$$

so the two are dependent even though they are conditionally independent given $\theta$. Plugging in the posterior-mean value for $\theta$ and squaring — the "plug-in" shortcut — therefore gets this quantity wrong.

<details class="recall-answer">
<summary>Check your answer</summary>
<div class="disclosure-body">

1. Not necessarily: the probability also depends on the posterior second moment, i.e. on the variance. A single Bernoulli success probability equal to the mean is a special linear case.
2. It must also be multiplied by the prior mass produced by the transition prediction, so the same observation under different old beliefs and actions produces different posteriors.

</div>
</details>

### 8.3 Thompson Sampling: act as if one sampled world were true

Draw $\tilde\theta\sim p(\theta\mid D)$, then act greedily with respect to $\tilde\theta$: choose the arm with the largest $\tilde\theta_a$, observe the reward, and update the posterior of that arm. The algorithm turns exploration into a Bayesian calculation — an arm is pulled if a draw happens to make it look good, and the frequency of such draws is the posterior probability that it *is* good. Its empirical success and its lingering theoretical gaps are both instructive: the posterior is only as good as the model, and the regret analysis needs the same confidence machinery as §4.11, just applied to the random draws.

### 8.4 POMDP: maintain a belief over hidden states, not a single frame

With hidden state $S_t$ and observation $O_t$, the belief is $b_t(s)=\Pr(S_t=s\mid o_{1:t},a_{1:t-1})$. Two steps alternate: a **prediction** step, which is a Markov chain step on the belief,

$$
\bar b_{t+1}(s')=\sum_s b_t(s)\sum_a\pi(a\mid s)\,p(s'\mid s,a),
$$

and a **correction** step, which is Bayes applied to the observation,

$$
b_{t+1}(s')=\frac{\bar b_{t+1}(s')\,p(o_{t+1}\mid s')}{\sum_{u}\bar b_{t+1}(u)\,p(o_{t+1}\mid u)}\,p(o_{t+1}).
$$

In practice the last factor is dropped since normalization enforces it. The belief state is a sufficient statistic for the history — this is the sharp sense in which a POMDP is an MDP with a continuous state space whose points are distributions.

### 8.5 Two kinds of belief: unknown parameter and unknown current state

It is easy to merge two objects that are structurally different. An unknown parameter $\Theta$ is *fixed* and does not change over time; conditioning on new data shrinks the posterior around it. An unknown current state $S_t$ *does* change, and the belief must be pushed forward by the dynamics before being corrected by any observation. Mixing the two produces the classic subtle error of updating a belief about a state without the transition step — the belief then "corrects" a state it no longer refers to.

<details class="recall-answer">
<summary>Check the computation and the conclusion</summary>
<div class="disclosure-body">

The posterior is $\operatorname{Beta}(8,4)$; both the MLE and the MAP are $0.7$, whereas the posterior mean is $2/3$. The probability of two successes is $8\cdot9/(12\cdot13)=6/13$, not $(2/3)^2$: the difference is exactly the dependence introduced by integrating out the shared unknown parameter.

The first old belief predicts $(0.8,0.2)$, multiplies by the likelihood to $(0.08,0.16)$, and normalizes to $(1/3,2/3)$. The second predicts $(0.5,0.5)$, multiplies to $(0.05,0.4)$, and normalizes to $(1/9,8/9)$. The same sensor reading does not determine a unique posterior.

</div>
</details>

## 9. Tying the lecture together: state the objective, estimate it, update the information

### 9.1 Not nine sets of isolated formulas, but three reusable chains

**The goal chain** runs from the reward hypothesis through vNM to expectation, and from expectation through the tower property to value functions and the Bellman decomposition. Its question is *what is being optimized*.

**The estimation chain** runs from Monte Carlo to the LLN and CLT and then to concentration: each step answers a question the previous one leaves open — from "does it converge" to "how fast in shape" to "how far at a fixed $n$". Its question is *how much error is allowed*.

**The information chain** runs from conditional probability through Bayes and conjugacy to posterior prediction, Thompson Sampling, and POMDP beliefs. Its question is *what has been learned, and what does it imply about the next decision*.

The chains meet twice. First in the value function: it is an expectation (chain 1), estimated from samples (chain 2), of a quantity whose state uncertainty may need a belief (chain 3). Second in exploration: an uncertainty bonus derived from a tail bound (chain 2) is the frequentist twin of drawing from a posterior (chain 3).

### 9.2 Self-test exercises

**(A)** Two fair dice with faces $1..4$: give the distribution of the maximum and verify the expectation is $25/8$. Then compute the variance.

**(B)** For a fixed policy, derive $V^\pi$ as the expected discounted return and show the one-step decomposition without assuming independence of the rewards across time.

**(C)** Show that the best affine predictor is the conditional mean exactly when the conditional mean is affine, and give a jointly non-Gaussian example where the two differ.

**(D)** With rewards in $[0,1]$, how many samples does Hoeffding's inequality require for a $0.1$-accurate estimate at $95\%$ confidence, and what does Chebyshev require with the worst-case variance?

**(E)** For the chain with $Q=\begin{pmatrix}0.5&0.5\\0.02&0.98\end{pmatrix}$, compute the stationary distribution, $d_{\mathrm{TV}}$ after $t$ steps from state 1, and the mixing time at tolerance $0.05$.

**(F)** Given a Beta prior and a sequence of Bernoulli observations, write the posterior, the posterior predictive for the next observation, and the predictive probability of two successes; explain why the last one is not the square of the previous one.

**(G)** Write the POMDP belief update and compare it with a Bayesian parameter update; state precisely which one needs the transition step and why.

### 9.3 Questions leading to the next lecture

If the expectation is the objective to estimate, the obvious follow-up is *which* expectation is cheapest to estimate. That is sampling: Monte Carlo with its variance, the shift between distributions that importance sampling performs, and the Markov-chain machinery of chapter 6 used to draw from a distribution we cannot sample directly — with MCMC and diffusion as the two consequences of the same correction step.

### 9.4 Sources and further reading

The content follows Lecture 1, *Randomness & Confidence: Probability, Concentration, and Markov Dynamics*, by Ziyu Shao at ShanghaiTech University, together with the handwritten explanations that accompanied it. Background reading that matches each chapter's tone: any standard probability text for chapters 1–4 (concentration inequalities in particular are treated at the level of the statements used here), a Markov chain text for chapters 5–6, and Bayesian texts such as Gelman et al. or Murphy for chapters 7–8. No course slides, handwritten files, or slide screenshots are reproduced or distributed on this page; the notation and examples are restated for independent study.

Cross-checks performed while writing these notes: the dice maximum has mean $1.6$, the weather chain of chapter 2 has expectation $3.4$, five returns averaging $2$ give an unbiased sample variance of $26/4=6.5$, Hoeffding's sample size is $\lceil\ln 40/(2\cdot0.01)\rceil=185$, the discounted sum at $\gamma=0.9$ is $18445$, the weather chain has $\pi=(0.6,0.4)$ and $t_{\mathrm{mix}}(0.05)=4$, the slow chain needs $114$ steps, the $\operatorname{Beta}(8,4)$ posterior has mean $2/3$, and two predictive successes give $6/13$.
