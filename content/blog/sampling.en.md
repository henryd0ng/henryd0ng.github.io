## Inverse transform sampling

Given a cumulative distribution function $F$, we want to generate a random variable $X$ with that distribution.

1. Draw $U \sim \operatorname{Uniform}(0, 1)$.
2. Set $X = F^{-1}(U)$, using the generalized inverse if the CDF has jumps or flat intervals.
3. Return $X$.

## Rejection sampling

Two views explain the same acceptance rule. One uses the **geometry of an envelope**. The other uses a **ratio of densities**.

### The geometry of the envelope

Cover the target density with an envelope that is easy to sample from. A rectangle makes the geometry easy to see. Shaping the envelope around a proposal density $g$ can reduce the number of rejected draws.

![Rectangular-envelope algorithm. Draw a uniform horizontal coordinate and a uniform height, then accept points below the target density.](/images/sampling/image-1.png)

![Proposal-envelope algorithm. Draw a candidate from the proposal and sample a height uniformly up to the scaled proposal density at that candidate.](/images/sampling/image.png)

The geometric argument relies on a property of uniform sampling. Draw a point uniformly from a region and keep it only if it falls in a smaller region inside it. The retained point is uniform on that smaller region.

### The acceptance probability

Suppose the proposal has density $g$ and there is a constant $c$ such that

$$
c \geq \sup_y \frac{f(y)}{g(y)}.
$$

Then the following procedure produces a sample from the target density $f$.

1. Draw a proposal $Y \sim g$.
2. Independently draw $U \sim \operatorname{Uniform}(0,1)$.
3. If $U \leq \frac{f(Y)}{c g(Y)}$, accept and return $X=Y$. Otherwise discard $Y$ and repeat from step 1.

![The acceptance test compares a uniform draw with the ratio of the target density to the envelope height](/images/sampling/image-2.png)

## Change of variables

<aside class="knowledge-cue knowledge-cue--extension" aria-label="Further reading">
<p class="knowledge-cue__label">Knowledge Extension · Change of Variables</p>
</aside>

A change of coordinates alters the amount of probability mass represented by a unit of length, area, or volume. Two cases matter for sampling.

- **Transformations in the same dimension.** For an invertible map $\mathbf{Y}=g(\mathbf{X})$, the transformed density is $f_Y(\mathbf{y})=f_X(\mathbf{x})\left|\det\frac{\partial\mathbf{x}}{\partial\mathbf{y}}\right|$. This lets us transform easy-to-generate random numbers into target samples. For example, the polar area element on a disk carries a factor of $r$. Sampling the radius uniformly would put too much probability near the center.
- **Surface parameterizations.** For a surface parameterized by $\mathbf{y}$, let $G=\left(\frac{\partial\mathbf{x}}{\partial\mathbf{y}}\right)^T\frac{\partial\mathbf{x}}{\partial\mathbf{y}}$. The area factor $\sqrt{\det G}$ converts a density $f_X$ per unit surface area into the density $f_Y(\mathbf{y})=f_X(\mathbf{x})\sqrt{\det G}$ in parameter coordinates. On a sphere the factor is $R^2\sin\phi$. To sample uniformly in surface area, draw the azimuth $\theta$ uniformly and draw $\cos\phi$ uniformly on $[-1,1]$.

This extends inverse transform sampling in one dimension to sampling in higher dimensions and on surfaces. The Box–Muller transform is another example of a same-dimensional transformation.

## Monte Carlo integration

If the $X_i$ are independent draws from $p$, the integral of $h$ against $p$ is an expectation. Its sample estimate is

$$
\int h(x)p(x)\,dx=\mathbb{E}_p[h(X)]
\approx\frac{1}{N}\sum_{i=1}^{N}h(X_i).
$$

This is useful when the integral is difficult to evaluate analytically or a grid would be too expensive in high dimensions. Given suitable draws, we only need to evaluate $h$ at the sampled points and average. With finite variance the standard error scales as $1/\sqrt{N}$. The variance of the integrand and the chance of visiting the regions that matter determine how well that rate serves us in practice.

## Indicator variables

We can represent an event $A$ by a random variable that takes the value zero or one.

$$
\mathbf{1}_A=
\begin{cases}
1,&A\text{ occurs},\\
0,&A\text{ does not occur},
\end{cases}
\qquad
\mathbb{E}[\mathbf{1}_A]=\Pr(A).
$$

To estimate an event probability, average its indicator over repeated draws. The resulting mean is the fraction of draws for which the event occurs. For example, sample points uniformly in a rectangle enclosing the Batman curve. Multiply the fraction falling inside the curve by the area of the rectangle to estimate the area enclosed by the curve.

## Importance sampling

Suppose we have samples from a convenient distribution $q$ and want an expectation under a different distribution $p$. Multiplying and dividing by $q(x)$ gives

$$
\mathbb{E}_p[h(X)]
=\int h(x)\frac{p(x)}{q(x)}q(x)\,dx
=\mathbb{E}_q\!\left[h(X)\frac{p(X)}{q(X)}\right].
$$

For draws $X_i\sim q$, average the quantities $h(X_i)\,p(X_i)/q(X_i)$. Each draw still comes from $q$. The weight $p/q$ changes how much that draw contributes to the estimate under $p$.

The proposal must assign positive probability wherever the target contributes to the integral. If $q$ puts very little mass in an important region of $p$, a handful of large weights can dominate the estimate. Rejection sampling produces target draws by discarding some proposals. Importance sampling keeps the proposals and reweights their contributions.

### Evaluating a new policy with trajectories from an old one

In reinforcement learning, a behavior policy $\mu$ may have generated the trajectories we have, while a target policy $\pi$ is the one whose expected return we want. If both policies face the same initial-state distribution and environmental dynamics, those terms cancel in the ratio of trajectory probabilities. The ratio depends only on the action probabilities.

$$
\rho(\tau)=\prod_{t=0}^{T-1}
\frac{\pi(a_t\mid s_t)}{\mu(a_t\mid s_t)}.
$$

We can therefore estimate the expected return of the new policy by weighting the old trajectories.

$$
J(\pi)=\mathbb{E}_{\pi}[G(\tau)]
=\mathbb{E}_{\mu}[\rho(\tau)G(\tau)].
$$

This is off-policy evaluation. We can reuse trajectories if the behavior policy covers the actions the target policy would take. Multiplying ratios over many time steps can nevertheless give the estimator high variance.

**Ordinary and self-normalized importance sampling.** With $N$ trajectories from the behavior policy, the ordinary importance sampling (IS) estimate is

$$
\widehat J_{\mathrm{IS}}=\frac1N\sum_{i=1}^{N}\rho_iG_i,
$$

Under the coverage condition and the usual integrability assumptions, this estimator is unbiased. A few large weights can still dominate it. The self-normalized or weighted IS estimate is

$$
\widehat J_{\mathrm{WIS}}=
\frac{\sum_{i=1}^{N}\rho_iG_i}{\sum_{i=1}^{N}\rho_i}.
$$

Normalizing the weights often makes the estimate more stable, at the cost of finite-sample bias. Both estimators depend on coverage. Normalization cannot supply observations of an action the behavior policy never took.

**When importance sampling fails.** If the target policy can take an action to which the behavior policy assigns zero probability, the required weight is undefined. Even with positive probabilities, very rare actions and long products of ratios can give a few trajectories huge weights and make the variance explode.

**Effective sample size (ESS).** One way to check how concentrated the weights are is to compute $\tilde\rho_i=\rho_i/\sum_j\rho_j$ and then

$$
\operatorname{ESS}=\frac{1}{\sum_{i=1}^{N}\tilde\rho_i^2}
=\frac{(\sum_i\rho_i)^2}{\sum_i\rho_i^2}.
$$

If the weights are similar, ESS is close to $N$. If almost all the weight falls on one trajectory, ESS is close to $1$. This quantity measures weight concentration. It neither counts actual independent samples nor establishes that the behavior policy covers the target.

## Markov chain Monte Carlo (MCMC)

When independent draws from the target are hard to obtain, we can construct a Markov chain with stationary distribution $\pi$. Once an ergodic chain has run long enough, the distribution of $X_t$ approaches $\pi$ and chain averages can estimate target expectations. Importance sampling adjusts the weights of existing samples. Metropolis–Hastings adjusts the transitions that generate them.

### Metropolis–Hastings

**Discrete states.** Let $\pi=(\pi_1,\ldots,\pi_M)$ be the target probability mass function and $Q=(q_{i,j})$ the proposal matrix. From state $i$, propose $j$ from $Q(i,\cdot)$ and accept it with probability

$$
\alpha_{i,j}=\min\!\left(1,\frac{\pi_jq_{j,i}}{\pi_iq_{i,j}}\right).
$$

**Continuous states.** For a target density $\pi(x)$, propose $y$ from the transition density $K(y\mid x)$ at the current state $x$. The acceptance probability is

$$
\alpha(x,y)=\min\!\left(1,
\frac{\tilde\pi(y)K(x\mid y)}{\tilde\pi(x)K(y\mid x)}\right).
$$

Move to the proposed state if it is accepted. On rejection, record the current state again. The unnormalized target density $\tilde\pi$ suffices because the normalizing constant cancels in the ratio.

**Example.** Suppose the proposal is symmetric, $\tilde\pi(x)=0.2$, and $\tilde\pi(y)=0.6$. The move $x\to y$ is always accepted. The reverse move $y\to x$ is accepted with probability $1/3$. Occasional moves to lower density balance the probability flowing in the two directions, which is what allows MH to sample the distribution.

### Gibbs Sampling

If the full conditional distributions of a joint law are easy to sample, update one coordinate at a time. Hold all the others fixed and draw that coordinate from its conditional distribution. A **systematic scan** visits the coordinates in a fixed order. A **random scan** chooses a coordinate at random at each step. Drawing directly from the target conditional dispenses with a separate acceptance test.

For example, take a bivariate standard normal with correlation $\rho$. Its two conditional distributions are

$$
X\mid Y=y\sim\mathcal N(\rho y,1-\rho^2),
\qquad
Y\mid X=x\sim\mathcal N(\rho x,1-\rho^2).
$$

One full sweep consists of the following two draws.

$$
X_{t+1}\sim\pi(x\mid Y_t),
\qquad
Y_{t+1}\sim\pi(y\mid X_{t+1}).
$$

Each draw updates only one coordinate. Successive sweeps eventually produce draws from the joint target under the usual convergence conditions. Strong correlation between coordinates can make movement slow in one direction, leaving successive samples highly correlated.

### A latent-variable example with hatching eggs

A hen lays $N\sim\operatorname{Pois}(\lambda)$ eggs. Each egg hatches with probability $p$, with prior $p\sim\operatorname{Beta}(a,b)$. We observe the number that hatch, $X=x$, but do not know how many fail to hatch. Treating the total $N$ as latent gives two simple conditional draws.

$$
p\mid N=n,X=x\sim\operatorname{Beta}(a+x,b+n-x),
\qquad
N-x\mid p,X=x\sim\operatorname{Pois}(\lambda(1-p)).
$$

The second line gives the number of unhatched eggs. Add the $x$ observed hatchlings to that draw to recover $N$. Alternate between drawing $p$ and drawing $N$. The resulting joint posterior samples let us estimate $\mathbb E[p\mid X=x]$. Introducing an unobserved variable can make the full conditionals easy to sample even when direct sampling from the posterior is difficult.

### Diagnosing an MCMC run

Recording more neighboring states does little for a region the chain has never visited. Inspect trace plots, compare chains started at different points, and examine autocorrelation and ESS. For MH, also check the acceptance rate. **When mixing is slow, many saved draws may carry little independent information.**

### Thompson sampling as a decision rule in RL

Thompson sampling uses posterior uncertainty to choose an action. Draw a possible model from the posterior over parameters, take an optimal action for that model, observe the outcome, and update the posterior before choosing again. Different posterior draws can favor different actions, so uncertainty induces exploration. If direct posterior draws are difficult, MCMC can approximate the sampling step within this decision rule.

### Random-Walk Metropolis

A random-walk proposal in MH chooses a candidate near the current state. It is useful for continuous distributions whose density we can evaluate even when direct sampling is difficult. It requires neither a gradient nor convenient full conditional distributions.

In $d$ dimensions, propose a candidate from the current state $x$ as follows.

$$
Y=x+\epsilon,
\qquad \epsilon\sim\mathcal N(0,\delta^2 I).
$$

The proposal is symmetric. Accept $Y$ with probability $\min\{1,\tilde\pi(Y)/\tilde\pi(x)\}$ and otherwise stay at $x$. Repeating these steps gives a chain for estimating target expectations. The step size $\delta$ controls the distance traveled. Very small steps explore slowly, while very large steps are often rejected.

### Gradient-guided proposals with Langevin dynamics and MALA

A random walk has no information about which direction locally increases the target density. For a differentiable density $\pi(x)$, its **score** $\nabla\log\pi(x)$ points in the direction of steepest increase of the log density.

A Langevin proposal combines a step along this gradient with a random perturbation.

$$
Y=x+\eta\nabla\log\pi(x)+\sqrt{2\eta}\,\xi,
\qquad \xi\sim\mathcal N(0,I).
$$

The gradient guides the move, and noise lets the chain explore beyond a density peak. Using this discretized update directly gives the unadjusted Langevin algorithm (ULA). To correct the bias introduced by discretization, the Metropolis-adjusted Langevin algorithm (MALA) applies an MH acceptance step using the proposal density $K$.

$$
\alpha(x,Y)=\min\!\left(1,
\frac{\tilde\pi(Y)K(x\mid Y)}{\tilde\pi(x)K(Y\mid x)}\right).
$$

The gradient lets the proposal exploit the local shape of the target. The MH correction preserves the target as the stationary distribution.

### Hamiltonian Monte Carlo (HMC)

MALA still moves in local steps. HMC augments the position $x$ with an auxiliary momentum $p$. It chooses a joint density proportional to $e^{-H(x,p)}$, with

$$
H(x,p)=U(x)+V(p),\qquad
U(x)=-\log\tilde\pi(x),\qquad
V(p)=\frac12p^TM^{-1}p,
\quad p\sim\mathcal N(0,M).
$$

Momentum turns local gradient information into a trajectory. Momentum drives position, and the force $-\nabla U(x)$ changes the momentum. In practice, take $L$ leapfrog steps to reach a candidate $(x',p')$, then reverse the momentum to form a reversible proposal. The acceptance step uses the change in energy.

$$
p_{k+\frac12}=p_k-\frac{\epsilon}{2}\nabla U(x_k),\qquad
x_{k+1}=x_k+\epsilon M^{-1}p_{k+\frac12},\qquad
p_{k+1}=p_{k+\frac12}-\frac{\epsilon}{2}\nabla U(x_{k+1}).
$$

Start with a half step in momentum using the gradient at the current position. Take a full position step, then complete the momentum update with the gradient at the new position. Repeat this sequence $L$ times to obtain the proposed trajectory.

$$
\alpha=\min\!\left(1,e^{-[H(x',p')-H(x,p)]}\right).
$$

Exact energy conservation would give acceptance probability one. Leapfrog makes a numerical error, which the MH step corrects. Following the shape of the density lets HMC cover longer distances with less random backtracking. The step size and trajectory length still need to be chosen to keep integration error under control.

### Mixing between two modes

Consider the following unequal-weight mixture of two Gaussians. It lets us test whether an HMC chain actually travels between the two peaks.

$$
\pi(x)=0.4\,\mathcal N(2,1)+0.6\,\mathcal N(-2,1).
$$

Up to an additive constant, the negative log density and its derivative are

$$
U(x)=\frac{x^2}{2}-\log\!\left(0.4e^{2x}+0.6e^{-2x}\right),
\qquad
U'(x)=x+2-4w_+(x),
\quad
w_+(x)=\frac{0.4e^{2x}}{0.4e^{2x}+0.6e^{-2x}}.
$$

A low-density valley separates the peaks. Refreshing the momentum can give the chain enough energy to cross it along a leapfrog trajectory. In this experiment the step size was $0.32$, with $L\sim\operatorname{Unif}\{10,\ldots,24\}$. The run retained 5,000 draws after warmup. The sample mean of $-0.4027$ and variance of $4.8883$ were close to the theoretical values of $-0.4$ and $4.84$. The chain crossed between modes 925 times.

The acceptance rate was $99.54\%$, yet the ESS of the mode indicator was about 608. Shorter trajectories raised acceptance to $99.98\%$ but yielded just 67 crossings, noticeably distorted mode frequencies, and an ESS of about 11. **For a multimodal target, check which modes the chain visits, how often it switches, and the ESS of the mode indicator.** Acceptance alone misses that part of the picture.

## Denoising diffusion probabilistic models (DDPM)

HMC starts with a specified target distribution. A DDPM learns a generative process from data. We choose a forward process that gradually adds noise to a sample. During generation, the model works backward from noise to produce a new sample. The forward process is fixed in advance.

### The forward process gradually adds Gaussian noise

Choose a noise schedule $\beta_t\in(0,1)$, set $\alpha_t=1-\beta_t$ and $\bar\alpha_t=\prod_{j=1}^{t}\alpha_j$, and define the transition

$$
q(x_t\mid x_{t-1})=\mathcal N(\sqrt{\alpha_t}x_{t-1},\beta_t I).
$$

Composing the Gaussian transitions gives a closed form at any time step.

$$
x_t=\sqrt{\bar\alpha_t}x_0+\sqrt{1-\bar\alpha_t}\,\epsilon,
\qquad \epsilon\sim\mathcal N(0,I).
$$

During training we can draw $t$ at random and construct $x_t$ in one step, skipping the intermediate states between $x_0$ and $x_t$. When $\bar\alpha_T\approx0$, the terminal state $x_T$ is approximately standard Gaussian noise.

### Training the network to predict the added noise

Give the network the noisy sample and the time step $t$. Train it to predict the particular noise $\epsilon$ used to construct $x_t$ by minimizing

$$
\mathcal L(\theta)=
\mathbb E_{x_0,t,\epsilon}
\left[\left\|\epsilon-\epsilon_\theta(x_t,t)\right\|^2\right].
$$

This is a supervised problem. We know the clean sample $x_0$ and the random noise $\epsilon$, and we construct the input $x_t$ from them. Each training example needs only one randomly chosen noise level.

### Generating a sample from the predicted noise

During training we know $x_0$, and the posterior $q(x_{t-1}\mid x_t,x_0)$ is exactly Gaussian. At generation time we have only $x_t$, and the true $q(x_{t-1}\mid x_t)$ need not be a single Gaussian. A DDPM approximates the reverse transition with a Gaussian whose mean depends on the predicted noise.

$$
\mu_\theta(x_t,t)=\frac1{\sqrt{\alpha_t}}
\left(x_t-\frac{\beta_t}{\sqrt{1-\bar\alpha_t}}
\epsilon_\theta(x_t,t)\right).
$$

Start from $x_T\sim\mathcal N(0,I)$ and iterate for $t=T,T-1,\ldots,1$.

$$
x_{t-1}=\mu_\theta(x_t,t)+\sigma_t z,
\qquad z\sim\mathcal N(0,I),
$$

On the final step, we usually set $z=0$. Two common fixed-variance choices are

$$
\sigma_t^2=\beta_t
\qquad\text{or}\qquad
\sigma_t^2=\tilde\beta_t
=\frac{1-\bar\alpha_{t-1}}{1-\bar\alpha_t}\,\beta_t.
$$

The first choice, $\beta_t$, uses the noise variance added at this step of the forward process. The second, $\tilde\beta_t$, uses the variance of the posterior $q(x_{t-1}\mid x_t,x_0)$ that would be available if we knew $x_0$.

## Score-based diffusion models (NCSN)

A DDPM predicts the noise added at a discrete time step. A noise-conditional score network (NCSN) learns the score of the data distribution at each noise scale.

$$
s_\sigma(x)=\nabla_x\log p_\sigma(x).
$$

Adding noise makes the score easier to learn. Clean data often cluster near a thin manifold in a high-dimensional space, with very low density away from it. Gaussian perturbations smooth the distribution into a density $p_\sigma$ that covers the whole space. Large noise scales connect distant regions, while small scales preserve local detail.

### Denoising score matching

Add Gaussian noise to a clean sample, giving $X_\sigma=X_0+\sigma\epsilon$ with $\epsilon\sim\mathcal N(0,I)$. The score of the marginal density $p_\sigma(x)$ is difficult to evaluate directly. Given a clean sample, however, the conditional score has a simple form.

$$
\nabla_x\log q(x\mid x_0)
=-\frac{x-x_0}{\sigma^2}
=-\frac{\epsilon}{\sigma}.
$$

The Gaussian kernel's normalizing constant depends on $\sigma$ alone. Taking the log gradient with respect to $x$ removes this constant, so we do not need to evaluate it.

Averaging this conditional score over the posterior of $x_0$ given the noisy observation yields the marginal score.

$$
s_\sigma(x)=\mathbb E\!\left[
\nabla_x\log q(X_\sigma\mid X_0)\mid X_\sigma=x
\right].
$$
The network receives $(X_\sigma,\sigma)$. Several clean samples could have produced the same noisy input, each giving a different conditional score as a label. Under squared error, the optimal predictor averages those labels conditional on $X_\sigma=x$, recovering the marginal score $s_\sigma(x)$. Giving the network $X_0$ as well would let it predict the conditional score instead. To see how the two losses relate, set $U=\nabla_x\log q(X_\sigma\mid X_0)$. Then

$$
\mathbb E\|s_\theta(X_\sigma,\sigma)-U\|^2
=\mathbb E\|s_\theta(X_\sigma,\sigma)-s_\sigma(X_\sigma)\|^2
+\mathbb E\|s_\sigma(X_\sigma)-U\|^2.
$$

The second term is independent of the network parameters. Minimizing the mean squared error against conditional scores therefore fits the marginal score. This is the same squared-error decomposition we used in the first lecture. [Conditional expectation as the minimum-error predictor](/en/blog/rl-probability/#section-3-2)
The known quantity $-\epsilon/\sigma$ provides the supervised target for training $s_\theta$.

$$
\mathcal L(\theta)=
\mathbb E_{\sigma,X_0,\epsilon}
\left[w(\sigma)\left\|
s_\theta(X_0+\sigma\epsilon,\sigma)+\frac{\epsilon}{\sigma}
\right\|^2\right].
$$

A common choice is $w(\sigma)=\sigma^2$, which balances the loss across noise scales.

**Tweedie's formula** \
For $X_\sigma=X_0+\sigma\epsilon$, we have

$$
 s_\sigma(x)
 =\frac{\mathbb E[X_0\mid X_\sigma=x]-x}{\sigma^2},
 \qquad
 \mathbb E[X_0\mid X_\sigma=x]
 =x+\sigma^2s_\sigma(x).
$$

Shift the noisy observation by the score scaled by $\sigma^2$. The result is the conditional mean of the clean sample, the estimate that minimizes squared error.

### Generating samples with annealed Langevin dynamics

Begin at a large noise scale. At each scale, use the score to guide the samples and add Langevin noise. Progressively reduce the noise scale.

$$
x\leftarrow x+\eta_i s_\theta(x,\sigma_i)
+\sqrt{2\eta_i}\,z,
\qquad z\sim\mathcal N(0,I),
\quad i=L,L-1,\ldots,1.
$$

High noise helps explore the overall distribution, and low noise resolves local detail. A DDPM predicts noise for a discrete reverse transition. An NCSN predicts scores at several scales and uses annealed Langevin updates to generate samples. For Gaussian perturbations, the two prediction targets are related by $s_\theta(x_t,t)=-\epsilon_\theta(x_t,t)/\sqrt{1-\bar\alpha_t}$.

## Diffusion in continuous time (SDEs and ODEs)

A stochastic differential equation (SDE) describes the forward process from data to noise in continuous time. Consider a diffusion coefficient that depends only on time.

$$
dX_t=f(X_t,t)\,dt+g(t)\,dW_t.
$$

The drift $f$ determines the directed motion of probability mass, and $g$ sets the strength of the Brownian noise. For a small time step $h$, the Euler–Maruyama update is

$$
X_{t+h}\approx X_t+h f(X_t,t)+g(t)\sqrt h\,z,
\qquad z\sim\mathcal N(0,I).
$$

We design the forward coefficients $f,g$ so that the data gradually approach a terminal distribution that is easy to sample.

### Reversing the distribution's evolution with the score

Write $s_t(x)=\nabla_x\log p_t(x)$. When we integrate backward from $T$ to $0$, the reverse-time SDE is

$$
dX_t=\bigl[f(X_t,t)-g(t)^2s_t(X_t)\bigr]dt
+g(t)\,d\bar W_t,
\qquad t:T\to0.
$$

We know the forward coefficients $f,g$. The unknown quantity is the marginal score $s_t$ at each time. Exact reverse generation starts from the true terminal law $p_T$. Substituting an approximate Gaussian prior can introduce error into the generated samples. Here $dt<0$, so a discrete step back from $t$ to $t-h$ takes the form

$$
x_{t-h}=x_t-hf(x_t,t)+hg(t)^2s_\theta(x_t,t)
+g(t)\sqrt h\,z.
$$

We can also use a generation clock that runs forward, $\tau=T-t$. In that convention, the score term has a positive coefficient.

$$
dY_\tau=\bigl[-f(Y_\tau,T-\tau)
+g(T-\tau)^2s_{T-\tau}(Y_\tau)\bigr]d\tau
+g(T-\tau)dW_\tau.
$$

Both equations describe the same reverse process. The drift signs follow the direction of the chosen clock. For a purely Brownian forward process ($f=0,g=1$), one reverse step gives $x_{t-h}=x_t+h s_t(x_t)+\sqrt h\,z$. Unlike Langevin sampling with a fixed target, reverse diffusion follows a different target distribution $p_t$ at each time step.

### DDPM as a discretization of the variance-preserving SDE

Set $\beta_k=\beta(t_k)h$ at each DDPM step. For small $h$,

$$
\sqrt{1-\beta_k}\approx1-\frac12\beta(t_k)h,
$$

As $h\to0$, the forward update converges to the variance-preserving (VP) SDE

$$
dX_t=-\frac12\beta(t)X_t\,dt+\sqrt{\beta(t)}\,dW_t.
$$

The discrete variance $\beta_k$ measures the noise added during one step. The continuous quantity $\beta(t)$ is a rate and must be multiplied by the step length $h$ to give a step variance.

### The probability-flow ODE and its time marginals

The density of the forward SDE obeys the Fokker–Planck equation

$$
\partial_t p_t=-\nabla\!\cdot(f p_t)
+\frac12g(t)^2\Delta p_t.
$$

Substituting $\nabla p_t=p_t s_t$ gives a continuity equation from which we can read off a deterministic velocity field.

$$
\frac{dX_t}{dt}=f(X_t,t)-\frac12g(t)^2s_t(X_t).
$$

With an exact score and suitable regularity, this probability-flow ODE has the same marginal distribution at each time as the forward SDE. Their individual trajectories differ. For generation we integrate from $T$ to $0$ in both cases. With $dt<0$, the reverse SDE has score coefficient $-g^2$, while the ODE uses $-\tfrac12g^2$. Thus converting the SDE into the ODE requires changing the drift as well as removing the noise term. The ODE trajectory is deterministic given its initial noise draw. The initial draw itself is random.

### Four equations connecting the three views

1. **Direct noising in a DDPM**

   $$
   x_t=\sqrt{\bar\alpha_t}x_0+\sqrt{1-\bar\alpha_t}\,\epsilon.
   $$

2. **Converting predicted noise to a score**

   $$
   s_\theta(x_t,t)=-\frac{\epsilon_\theta(x_t,t)}{\sqrt{1-\bar\alpha_t}}.
   $$

3. **Reverse SDE integrated from $t=T$ to $t=0$**

   $$
   dX_t=[f(X_t,t)-g(t)^2s_t(X_t)]dt+g(t)d\bar W_t.
   $$

4. **Probability-flow ODE, also integrated from $T$ to $0$**

   $$
   \frac{dX_t}{dt}=f(X_t,t)-\frac12g(t)^2s_t(X_t).
   $$


## Flow matching and deterministic transport from noise to data

DDPMs and score networks learn to reverse a noising process. Flow matching learns a time-dependent velocity field $v_\theta(x,t)$ that transports samples from a noise distribution to the data distribution along an ODE.

$$
\frac{d\hat X_t}{dt}=v_\theta(\hat X_t,t),
\qquad \hat X_0\sim p_{\mathrm{noise}},\quad t\in[0,1].
$$

Here $t=0$ denotes noise and $t=1$ denotes data, reversing the time convention used above for DDPMs. Three choices play different roles in flow matching. We choose a probability path between the endpoints, a target velocity for training the network, and a numerical method for integrating the generation ODE.

### Linear reference paths and velocity targets

Draw $Z\sim\mathcal N(0,I)$ from the noise distribution and $Y\sim p_{\mathrm{data}}$ from the data distribution. Linearly interpolate between the endpoints.

$$
X_t=(1-t)Z+tY,
\qquad X_0=Z,\quad X_1=Y.
$$

Differentiating this reference path gives its velocity directly.

$$
\dot X_t=Y-Z.
$$

A training pair consists of the input $(X_t,t)$ and target $Y-Z$. We can construct it without solving the generation ODE. The resulting conditional flow matching loss is

$$
\mathcal L_{\mathrm{CFM}}(\theta)
=\mathbb E_{t,Z,Y}
\left\|v_\theta((1-t)Z+tY,t)-(Y-Z)\right\|^2.
$$

### From conditional velocities to the marginal velocity

At generation time we know only a location $x$ and a time $t$. Many pairs of endpoints $(Z,Y)$ could have produced that location. The squared-error optimal prediction therefore averages the reference velocities over the endpoint pairs conditional on passing through $x$ at time $t$.

$$
u_t(x)=\mathbb E[Y-Z\mid X_t=x].
$$

This is the velocity field for the marginal probability path $p_t$. We can also condition on a fixed data endpoint $Y=y$. Then $X_t\mid Y=y\sim\mathcal N(ty,(1-t)^2I)$, and the corresponding conditional velocity is

$$
u_t(x\mid y)=\frac{y-x}{1-t},\qquad t<1.
$$

Averaging over the posterior distribution of the endpoint recovers the same field, $u_t(x)=\mathbb E[u_t(X_t\mid Y)\mid X_t=x]$. Training on conditional velocities that we can compute thus gives the network a target marginal velocity that depends only on $(x,t)$.

The squared-error objectives satisfy

$$
\mathcal L_{\mathrm{CFM}}(\theta)
=\mathcal L_{\mathrm{FM}}(\theta)+C,
\qquad C\text{ is independent of }\theta,
$$

The two objectives have the same population gradient with respect to the network parameters. We can train the model without explicitly computing the marginal velocity $u_t$.

### Why straight training paths can yield curved trajectories

During training, each pair $(Z,Y)$ defines a straight line and supplies its local velocity label $Y-Z$. The generation ODE, however, can assign only one velocity $v_\theta(x,t)$ to a given point in space and time. Where several reference lines meet, the regression returns their conditional average. An individual generated trajectory can therefore curve even though every reference path used for training is straight.

The ideal marginal velocity satisfies the continuity equation $\partial_t p_t+\nabla\cdot(p_tu_t)=0$. Starting from $p_{\mathrm{noise}}$ and integrating along $u_t$ transports the distribution of the whole population to $p_{\mathrm{data}}$. This is why matching distributional transport does not require reproducing any particular pairing of training endpoints.
