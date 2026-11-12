## Inverse Transform Method（逆变换法）

**输入：** 累积分布函数 $F$

**输出：** 服从分布 $F$ 的随机变量 $X$

1. 生成 $U \sim \operatorname{Uniform}(0, 1)$。
2. 令 $X = F^{-1}(U)$。
3. 返回 $X$。

## Acceptance–Rejection Method（接受-拒绝法）

接受-拒绝法可以从两个等价的角度理解：**几何包络**和**概率比值**。

### 几何包络

先用一个容易采样的包络分布覆盖目标密度，再按规则接受或拒绝提议样本。矩形包络是直观的起点；用提议分布 $g$ 构造包络，通常可以减少不必要的拒绝、提高采样效率。

![矩形包络下的接受-拒绝采样示意图](/images/sampling/image-1.png)

![使用提议分布构造包络的接受-拒绝采样示意图](/images/sampling/image.png)

几何直觉：在一个区域内均匀采样时，给定样本落在某个子区域内，它在该子区域中仍然是均匀分布的。

### 概率比值

若提议分布为 $g$，且存在常数 $c$ 满足

$$
c \geq \sup_y \frac{f(y)}{g(y)},
$$

则可以按以下步骤从目标密度 $f$ 采样：

1. 生成提议样本 $Y \sim g$。
2. 生成 $U \sim \operatorname{Uniform}(0, 1)$。
3. 若 $U \leq \frac{f(Y)}{c g(Y)}$，则接受并令 $X = Y$；否则拒绝 $Y$，回到第 1 步。

![接受-拒绝法的概率比值接受判据](/images/sampling/image-2.png)

## Knowledge Extension：Change of Variables（变量变换）

<aside class="knowledge-cue knowledge-cue--extension" aria-label="知识拓展">
<p class="knowledge-cue__label">Knowledge Extension · Change of Variables（变量变换）</p>
</aside>

变量变换追踪坐标映射如何改变概率密度。它有两种形式：

- **同维变换：** $\mathbf{Y}=g(\mathbf{X})$ 可逆时，$f_Y(\mathbf{y})=f_X(\mathbf{x})\left|\det\frac{\partial\mathbf{x}}{\partial\mathbf{y}}\right|$。它让我们把容易生成的随机数映射成目标样本；例如圆盘均匀采样时，极坐标面积因子为 $r$，所以半径不能直接均匀抽。
- **曲面变换：** $G=\left(\frac{\partial\mathbf{x}}{\partial\mathbf{y}}\right)^T\frac{\partial\mathbf{x}}{\partial\mathbf{y}}$，参数坐标的面积因子为 $\sqrt{\det G}$；它把曲面面积密度 $f_X$ 换成参数坐标密度 $f_Y(\mathbf{y})=f_X(\mathbf{x})\sqrt{\det G}$。球面的因子为 $R^2\sin\phi$，所以面积随极角变化；令 $\theta$ 均匀、$\cos\phi$ 均匀，才能在球面上均匀采样。

**采样上的扩展：** 从一维反函数采样，推广到多维空间与曲面上的正确采样；Box–Muller 是同维变换的另一例。

## Monte Carlo Integration（蒙特卡洛积分）

若 $X_i$ 是从 $p$ 独立抽取的样本，积分就是函数值的期望，可用样本平均估计：

$$
\int h(x)p(x)\,dx=\mathbb{E}_p[h(X)]
\approx\frac{1}{N}\sum_{i=1}^{N}h(X_i).
$$

它解决的是积分难以解析计算、尤其高维网格计算代价很高的问题：有了合适的样本，就能用函数值平均来近似积分。误差通常按 $1/\sqrt{N}$ 缩小，实际效果仍取决于被积函数的方差和样本是否覆盖到重要区域。

## Knowledge Extension：Indicator（指示变量）

事件 $A$ 可以写成一个取值为 0 或 1 的随机变量：

$$
\mathbf{1}_A=
\begin{cases}
1,&A\text{ 发生},\\
0,&A\text{ 不发生},
\end{cases}
\qquad
\mathbb{E}[\mathbf{1}_A]=\Pr(A).
$$

因此，估计概率就是估计指示变量的期望：重复采样并计算 $\mathbf{1}_A$ 的平均值，就是事件发生的样本比例。比如随机点落入 Batman 曲线围成区域的概率，乘上包围盒面积，就估计出该区域的面积。

## Importance Sampling（重要性采样）

我们有容易抽取的来源分布 $q$ 的样本，却想计算目标分布 $p$ 下的期望。乘除 $q(x)$，把目标期望改写为

$$
\mathbb{E}_p[h(X)]
=\int h(x)\frac{p(x)}{q(x)}q(x)\,dx
=\mathbb{E}_q\!\left[h(X)\frac{p(X)}{q(X)}\right].
$$

因此，对 $X_i\sim q$ 加权平均 $h(X_i)\,p(X_i)/q(X_i)$，就能用来源样本估计目标期望。权重 $p/q$ 校正两种分布下样本的重要程度；这不是把样本变成来自 $p$，而是改变每个样本对答案的贡献。

关键条件是：凡是目标分布 $p$ 有贡献的区域，来源分布 $q$ 都必须可能采到。$q$ 与 $p$ 差太远时，少数极大权重会让估计非常不稳定。和接受-拒绝法相比，重要性采样保留并重加权提议样本，接受-拒绝法则丢弃一部分样本来得到目标分布的样本。

### 与强化学习的关系：用旧策略数据评估新策略

强化学习中，旧策略（行为策略）$\mu$ 采集了轨迹，却想估计新策略（目标策略）$\pi$ 的期望回报。若初始状态分布和环境动力学相同，轨迹概率之比中环境项抵消，只剩动作概率之比：

$$
\rho(\tau)=\prod_{t=0}^{T-1}
\frac{\pi(a_t\mid s_t)}{\mu(a_t\mid s_t)}.
$$

于是新策略的期望回报可由旧策略轨迹加权估计：

$$
J(\pi)=\mathbb{E}_{\pi}[G(\tau)]
=\mathbb{E}_{\mu}[\rho(\tau)G(\tau)].
$$

这就是离策略评估：不必只为评估新策略重新采样，但旧策略必须覆盖新策略会采取的动作。逐步概率比相乘也可能造成高方差，所以“能校正”不等于“估计稳定”。

**普通 IS 与归一化 IS。** 对 $N$ 条旧策略轨迹，普通 IS 为

$$
\widehat J_{\mathrm{IS}}=\frac1N\sum_{i=1}^{N}\rho_iG_i,
$$

在覆盖等条件满足时无偏，但可能被少数大权重主导。归一化 IS 为

$$
\widehat J_{\mathrm{WIS}}=
\frac{\sum_{i=1}^{N}\rho_iG_i}{\sum_{i=1}^{N}\rho_i}.
$$

它通常更稳定，但有限样本有偏。工程上是在无偏性与方差之间取舍；归一化不能修复行为策略从未覆盖的动作。

**When Importance Sampling Fails：** 若目标策略会选某动作而行为策略概率为零，权重无法定义，缺失的数据也无法靠重加权补回；即使概率非零，极小的行为概率或长轨迹上的比值连乘，也可能使少数权重极大、估计方差爆炸。

**ESS（有效样本量）**用来检查权重是否集中。令 $\tilde\rho_i=\rho_i/\sum_j\rho_j$，则

$$
\operatorname{ESS}=\frac{1}{\sum_{i=1}^{N}\tilde\rho_i^2}
=\frac{(\sum_i\rho_i)^2}{\sum_i\rho_i^2}.
$$

权重相近时 ESS 接近 $N$；若几乎全由一条轨迹承担，则接近 $1$。它是权重退化的诊断量，不是实际独立样本数，也不能证明支持集覆盖充分。

## Markov Chain Monte Carlo（MCMC）

直接从目标分布独立抽样很难时，MCMC 构造一条以目标分布 $\pi$ 为平稳分布的马尔可夫链。链充分运行后，$X_t$ 近似服从 $\pi$，可用链上的样本估计期望。重要性采样重加权已有样本；MH 则校正采样过程本身。

### Metropolis–Hastings

**PMF（离散状态）**：目标分布为 $\pi=(\pi_1,\ldots,\pi_M)$，提议矩阵为 $Q=(q_{i,j})$。当前在 $i$，按 $Q(i,\cdot)$ 提议 $j$，接受率为

$$
\alpha_{i,j}=\min\!\left(1,\frac{\pi_jq_{j,i}}{\pi_iq_{i,j}}\right).
$$

**PDF（连续状态）**：目标密度为 $\pi(x)$，从当前状态 $x$ 按转移密度 $K(y\mid x)$ 提议 $y$，接受率为

$$
\alpha(x,y)=\min\!\left(1,
\frac{\tilde\pi(y)K(x\mid y)}{\tilde\pi(x)K(y\mid x)}\right).
$$

接受就移动到候选点，否则留在原处。只需目标的未归一化密度 $\tilde\pi$，因为归一化常数在比值中抵消。

**讲义例子与 insight：** 若提议对称，且 $\tilde\pi(x)=0.2$、$\tilde\pi(y)=0.6$，则 $x\to y$ 必定接受，反向 $y\to x$ 以 $1/3$ 概率接受。允许向低密度处移动，才能平衡正反向概率流；MH 是采样，不是贪心找最大值。

### Gibbs Sampling

若联合分布的条件分布容易采样，就可以逐个更新坐标：固定其他坐标，从该坐标的条件分布抽样。按固定顺序轮流更新是 **systematic scan**；每步随机选一个坐标更新是 **random scan**。每次都从目标条件分布抽样，因此不需要像 MH 那样再做接受/拒绝。

以相关系数为 $\rho$ 的二元标准正态为例：

$$
X\mid Y=y\sim\mathcal N(\rho y,1-\rho^2),
\qquad
Y\mid X=x\sim\mathcal N(\rho x,1-\rho^2).
$$

一轮更新为

$$
X_{t+1}\sim\pi(x\mid Y_t),
\qquad
Y_{t+1}\sim\pi(y\mid X_{t+1}).
$$

虽然每次只抽一个坐标，连续更新会生成目标联合分布的样本；但坐标相关越强，链沿某一方向移动得越慢，样本也越相关。

### 潜变量例子：鸡蛋孵化模型

母鸡产蛋数 $N\sim\operatorname{Pois}(\lambda)$，每个蛋以概率 $p$ 孵化，先验 $p\sim\operatorname{Beta}(a,b)$。只观察到孵化数 $X=x$，未孵化数未知。引入潜变量 $N$ 后，两步条件抽样都很简单：

$$
p\mid N=n,X=x\sim\operatorname{Beta}(a+x,b+n-x),
\qquad
N\mid p,X=x=x+\operatorname{Pois}(\lambda(1-p)).
$$

交替抽 $p$ 和 $N$，就能用联合后验的样本估计 $\mathbb E[p\mid X=x]$。Insight：整体后验难抽时，加入未观测变量，可能让各个条件分布变得容易抽。

### MCMC 诊断

链没探索到的区域，不会因为多记一些相邻样本就自动补上。看 trace plot、多条不同初值的链、自相关和 ESS；MH 还可看接受率。**混合差时，样本数不等于信息量。**

### 回到 RL：Thompson Sampling 是一种决策策略

TS 不是采样算法，而是用后验不确定性来选动作的策略：先从参数后验抽一个可能的模型，再按这个模型选择最优动作；观察结果后更新后验并重新决策。抽样是决策规则中的一步，不同后验样本可能导向不同动作，因此探索由不确定性自然产生。若后验难以直接抽样，可以用 MCMC 等方法近似抽样；MCMC 是采样方法，TS 是决策策略。

### Random-Walk Metropolis

随机游走是 MH 的一种提议方式：从当前位置附近随机提出下一候选，适用于目标密度可计算、但难以直接采样的连续分布。它不需要梯度或容易抽样的条件分布，简单通用。

在 $d$ 维空间，当前状态为 $x$ 时，提议

$$
Y=x+\epsilon,
\qquad \epsilon\sim\mathcal N(0,\delta^2 I).
$$

该提议对称，因此以 $\min\{1,\tilde\pi(Y)/\tilde\pi(x)\}$ 的概率接受 $Y$，否则留在 $x$。反复提议并接受/拒绝，就得到用于估计目标分布期望的链。步长 $\delta$ 控制移动距离：太小探索慢，太大则常被拒绝。

### 利用梯度：Langevin 与 MALA

随机游走只看当前位置，不知道目标密度往哪个方向变大。对可微目标密度 $\pi(x)$，其 **score** $\nabla\log\pi(x)$ 指向局部密度上升最快的方向。

Langevin 提议把梯度方向和随机扰动结合：

$$
Y=x+\eta\nabla\log\pi(x)+\sqrt{2\eta}\,\xi,
\qquad \xi\sim\mathcal N(0,I).
$$

梯度引导移动，噪声让链继续探索而非只爬向密度峰。直接使用这个离散提议称为 ULA；为消除离散化带来的目标分布偏差，MALA 再按提议密度 $K$ 做 MH 校正：

$$
\alpha(x,Y)=\min\!\left(1,
\frac{\tilde\pi(Y)K(x\mid Y)}{\tilde\pi(x)K(Y\mid x)}\right).
$$

因此，MALA 可看作“梯度引导的提议 + MH 校正”：比随机游走更会利用目标分布的局部形状，同时仍以目标分布为平稳分布。

### Hamiltonian Monte Carlo（HMC）

MALA 每次仍是局部移动。HMC 给位置 $x$ 加一个辅助动量 $p$，令目标联合密度正比于 $e^{-H(x,p)}$：

$$
H(x,p)=U(x)+V(p),\qquad
U(x)=-\log\tilde\pi(x),\qquad
V(p)=\frac12p^TM^{-1}p,
\quad p\sim\mathcal N(0,M).
$$

动量把梯度信息转成一段连续运动：位置受动量推动，动量受 $-\nabla U(x)$ 推动。实际用 leapfrog 数值积分走 $L$ 步，得到远处候选 $(x',p')$，再反转动量以构成可逆提议，并按能量差接受：

$$
p_{k+\frac12}=p_k-\frac{\epsilon}{2}\nabla U(x_k),\qquad
x_{k+1}=x_k+\epsilon M^{-1}p_{k+\frac12},\qquad
p_{k+1}=p_{k+\frac12}-\frac{\epsilon}{2}\nabla U(x_{k+1}).
$$

即先用当前位置的梯度更新半步动量，再推进整步位置，最后用新位置的梯度完成动量更新；重复 $L$ 步得到候选轨迹。

$$
\alpha=\min\!\left(1,e^{-[H(x',p')-H(x,p)]}\right).
$$

若轨迹精确守恒能量就会接受；leapfrog 有数值误差，MH 校正这个误差。HMC 利用梯度沿目标分布的形状走出较长距离，比随机游走少些无方向的折返；步长和步数仍需调节，以免积分误差过大。

### 双峰分布中的跨模态混合

Part 2 用不等权的双峰高斯检验 HMC 是否能在两个峰之间移动：

$$
\pi(x)=0.4\,\mathcal N(2,1)+0.6\,\mathcal N(-2,1).
$$

目标负对数密度（忽略常数）及其梯度为

$$
U(x)=\frac{x^2}{2}-\log\!\left(0.4e^{2x}+0.6e^{-2x}\right),
\qquad
U'(x)=x+2-4w_+(x),
\quad
w_+(x)=\frac{0.4e^{2x}}{0.4e^{2x}+0.6e^{-2x}}.
$$

两个峰之间有低密度谷。HMC 刷新动量并沿 leapfrog 轨迹前进，有机会带着动量穿过谷；这次实验取步长 $0.32$、$L\sim\operatorname{Unif}\{10,\ldots,24\}$，warmup 后保留 5000 个样本。样本均值 $-0.4027$、方差 $4.8883$，接近理论值 $-0.4$ 和 $4.84$；链在两个模式间穿越 925 次。

关键诊断：接受率虽达 $99.54\%$，模式指示变量的 ESS 约为 608；短轨迹方案接受率更高（$99.98\%$），却只穿越 67 次，模式占比明显偏差，ESS 仅约 11。**高接受率不等于混合好；要看是否访问各模式、模式切换次数及对应 ESS。**

## Diffusion Model I：DDPM

HMC 是从目标分布采样；DDPM 则学习一个生成过程：训练时逐步把数据加噪，生成时从噪声逐步还原出新样本。前向加噪过程由我们预先设定，不需要学习。

### 前向过程：逐步加高斯噪声

选定噪声日程 $\beta_t\in(0,1)$，令 $\alpha_t=1-\beta_t$、$\bar\alpha_t=\prod_{j=1}^{t}\alpha_j$，定义

$$
q(x_t\mid x_{t-1})=\mathcal N(\sqrt{\alpha_t}x_{t-1},\beta_t I).
$$

连续应用高斯转移可得任意时刻的闭式表达：

$$
x_t=\sqrt{\bar\alpha_t}x_0+\sqrt{1-\bar\alpha_t}\,\epsilon,
\qquad \epsilon\sim\mathcal N(0,I).
$$

因此训练时可以直接随机选 $t$、一次构造 $x_t$，不用从 $x_0$ 逐步模拟到 $x_t$。当 $\bar\alpha_T\approx0$，末端 $x_T$ 近似标准高斯噪声。

### 训练：让网络预测加进去的噪声

给网络输入带噪样本和时间 $t$，训练它预测生成 $x_t$ 时使用的 $\epsilon$：

$$
\mathcal L(\theta)=
\mathbb E_{x_0,t,\epsilon}
\left[\left\|\epsilon-\epsilon_\theta(x_t,t)\right\|^2\right].
$$

这是监督学习：干净样本 $x_0$ 与随机噪声 $\epsilon$ 已知，$x_t$ 由公式合成。每个训练样本只需随机选一个噪声级。

### 生成：用预测噪声逐步反推

训练时知道 $x_0$，后验 $q(x_{t-1}\mid x_t,x_0)$ 是精确高斯；生成时没有 $x_0$，真实的 $q(x_{t-1}\mid x_t)$ 一般不是单一高斯。DDPM 用网络预测噪声来参数化一个高斯反向转移，其均值为

$$
\mu_\theta(x_t,t)=\frac1{\sqrt{\alpha_t}}
\left(x_t-\frac{\beta_t}{\sqrt{1-\bar\alpha_t}}
\epsilon_\theta(x_t,t)\right).
$$

从 $x_T\sim\mathcal N(0,I)$ 开始，按 $t=T,T-1,\ldots,1$ 迭代：

$$
x_{t-1}=\mu_\theta(x_t,t)+\sigma_t z,
\qquad z\sim\mathcal N(0,I),
$$

最后一步通常令 $z=0$。常见的固定方差选择是

$$
\sigma_t^2=\beta_t
\qquad\text{或}\qquad
\sigma_t^2=\tilde\beta_t
=\frac{1-\bar\alpha_{t-1}}{1-\bar\alpha_t}\,\beta_t.
$$

$\beta_t$ 取前向过程该步加入的噪声方差；$\tilde\beta_t$ 则是已知 $x_0$ 时后验 $q(x_{t-1}\mid x_t,x_0)$ 的方差。它们是反向采样方差的两种常见设定。

## Diffusion Model II：Score-Based View（NCSN）

DDPM 学的是每个离散时间步加入的噪声；score-based 方法直接学习各噪声尺度下的数据分布 score：

$$
s_\sigma(x)=\nabla_x\log p_\sigma(x).
$$

先加噪是为了让 score 更容易学习：干净数据常集中在高维空间的薄流形附近，流形外密度很低；高斯扰动把它平滑成覆盖整个空间的 $p_\sigma$。大噪声连接较远区域，小噪声保留局部细节。

### 去噪 score matching

给干净样本加高斯噪声：$X_\sigma=X_0+\sigma\epsilon$，其中 $\epsilon\sim\mathcal N(0,I)$。虽然边缘分布 $p_\sigma(x)$ 的 score 难以直接计算，已知干净样本时的条件 score 很简单：

$$
\nabla_x\log q(x\mid x_0)
=-\frac{x-x_0}{\sigma^2}
=-\frac{\epsilon}{\sigma}.
$$

高斯核的归一化常数只依赖 $\sigma$，不依赖 $x$；对 $x$ 求对数梯度时该常数消失，所以无需计算归一化器。

这个条件 score 对 $x_0$ 的后验取平均，正好等于边缘 score：

$$
s_\sigma(x)=\mathbb E\!\left[
\nabla_x\log q(X_\sigma\mid X_0)\mid X_\sigma=x
\right].
$$
网络输入是 $(X_\sigma,\sigma)$，不含 $X_0$；同一个带噪输入可能来自不同干净样本，对应不同的条件 score 标签。平方误差的最优预测是这些标签在给定 $X_\sigma=x$ 后的条件平均，正好就是边缘 score $s_\sigma(x)$。若把 $X_0$ 也作为输入，学到的才会是条件 score。令 $U=\nabla_x\log q(X_\sigma\mid X_0)$，有

$$
\mathbb E\|s_\theta(X_\sigma,\sigma)-U\|^2
=\mathbb E\|s_\theta(X_\sigma,\sigma)-s_\sigma(X_\sigma)\|^2
+\mathbb E\|s_\sigma(X_\sigma)-U\|^2.
$$

第二项与网络参数无关，因此最小化条件 score 的 MSE 就是在拟合边缘 score。
因此可用已知的 $-\epsilon/\sigma$ 作监督目标，训练 $s_\theta$：

$$
\mathcal L(\theta)=
\mathbb E_{\sigma,X_0,\epsilon}
\left[w(\sigma)\left\|
s_\theta(X_0+\sigma\epsilon,\sigma)+\frac{\epsilon}{\sigma}
\right\|^2\right].
$$

常见权重取 $w(\sigma)=\sigma^2$，平衡不同噪声尺度的损失大小。

**Tweedie identity** \
对 $X_\sigma=X_0+\sigma\epsilon$，

$$
 s_\sigma(x)
 =\frac{\mathbb E[X_0\mid X_\sigma=x]-x}{\sigma^2},
 \qquad
 \mathbb E[X_0\mid X_\sigma=x]
 =x+\sigma^2s_\sigma(x).
$$

这个等式的物理意义是，带噪结果位移一个缩放的分数函数后，就成为了原始数据的最优估计（条件期望）

### 生成：Annealed Langevin

从大噪声开始，在每个尺度用 score 引导样本、同时加入 Langevin 噪声，再逐级降低噪声尺度：

$$
x\leftarrow x+\eta_i s_\theta(x,\sigma_i)
+\sqrt{2\eta_i}\,z,
\qquad z\sim\mathcal N(0,I),
\quad i=L,L-1,\ldots,1.
$$

大噪声先帮助探索整体分布，小噪声再刻画局部细节。与 DDPM 的区别在表示和采样方式：DDPM 预测离散反向步骤所需的噪声；NCSN 预测多尺度 score，并用退火 Langevin 逐级生成。对高斯加噪，两种预测目标可互相换算：$s_\theta(x_t,t)=-\epsilon_\theta(x_t,t)/\sqrt{1-\bar\alpha_t}$。

## Diffusion Model III：SDE 与 ODE 视角

SDE 视角用连续时间描述从数据到噪声的前向过程。考虑扩散强度只随时间变化的 SDE：

$$
dX_t=f(X_t,t)\,dt+g(t)\,dW_t.
$$

$f$ 是漂移，决定概率质量的定向移动；$g$ 控制 Brownian 噪声强度。小步长 $h$ 下，Euler–Maruyama 更新为

$$
X_{t+h}\approx X_t+h f(X_t,t)+g(t)\sqrt h\,z,
\qquad z\sim\mathcal N(0,I).
$$

前向的 $f,g$ 由我们设计，使数据逐渐变成易采样的终端分布。

### 反向 SDE：用 score 反转分布演化

令 $s_t(x)=\nabla_x\log p_t(x)$。沿时间从 $T$ 向 $0$ 积分，反向 SDE 为

$$
dX_t=\bigl[f(X_t,t)-g(t)^2s_t(X_t)\bigr]dt
+g(t)\,d\bar W_t,
\qquad t:T\to0.
$$

前向过程 $f,g$ 已知，未知的是各时刻的边缘 score $s_t$。生成从真实终端分布 $p_T$ 初始化；若用近似高斯先验，近似也会传到生成结果。由于这里 $dt<0$，从 $t$ 退回 $t-h$ 的离散更新写成

$$
x_{t-h}=x_t-hf(x_t,t)+hg(t)^2s_\theta(x_t,t)
+g(t)\sqrt h\,z.
$$

也可改用向前运行的生成时钟 $\tau=T-t$。此时 score 项系数为正：

$$
dY_\tau=\bigl[-f(Y_\tau,T-\tau)
+g(T-\tau)^2s_{T-\tau}(Y_\tau)\bigr]d\tau
+g(T-\tau)dW_\tau.
$$

这两种写法描述同一个反向过程，时间变量方向不同，因此不能混用漂移符号。纯 Brownian 前向加噪（$f=0,g=1$）时，反向一步为 $x_{t-h}=x_t+h s_t(x_t)+\sqrt h\,z$；它与固定目标的 Langevin 更新不同，因为反向扩散每一步的目标分布 $p_t$ 都在变化。

### DDPM 是 VP-SDE 的离散形式

若 DDPM 每步取 $\beta_k=\beta(t_k)h$，则

$$
\sqrt{1-\beta_k}\approx1-\frac12\beta(t_k)h,
$$

其前向更新在 $h\to0$ 时收敛到 variance-preserving SDE：

$$
dX_t=-\frac12\beta(t)X_t\,dt+\sqrt{\beta(t)}\,dW_t.
$$

这里离散方差 $\beta_k$ 是每个时间步的噪声量；连续速率 $\beta(t)$ 还乘着步长 $h$，两者不能直接当成同一尺度。

### Probability-flow ODE：相同边缘分布的确定性路径

前向 SDE 的密度满足 Fokker–Planck 方程：

$$
\partial_t p_t=-\nabla\!\cdot(f p_t)
+\frac12g(t)^2\Delta p_t.
$$

利用 $\nabla p_t=p_t s_t$，可将它改写成连续性方程，并读出确定性速度场：

$$
\frac{dX_t}{dt}=f(X_t,t)-\frac12g(t)^2s_t(X_t).
$$

这个 probability-flow ODE 与前向 SDE 在 score 精确等条件下具有相同的各时刻边缘分布；但它们的随机轨迹并不相同。对应的反向 SDE 和 ODE 都从 $T$ 积分到 $0$，反向 SDE 的 score 系数是 $-g^2$（按 $dt<0$ 积分），ODE 的系数是 $-\tfrac12g^2$。因此 ODE 不是简单删掉 SDE 的噪声项，漂移也必须改变。ODE 对给定噪声初值是确定的，但初值本身随机。

### 四个公式串起三种视角

1. **直接加噪（DDPM）：**
	$$x_t=\sqrt{\bar\alpha_t}x_0+\sqrt{1-\bar\alpha_t}\,\epsilon.$$
2. **噪声与 score 换算：**
	$$s_\theta(x_t,t)=-\frac{\epsilon_\theta(x_t,t)}{\sqrt{1-\bar\alpha_t}}.$$
3. **反向 SDE，时间 $t:T\to0$：**
	$$dX_t=[f(X_t,t)-g(t)^2s_t(X_t)]dt+g(t)d\bar W_t.$$
4. **Probability-flow ODE，同样从 $T$ 积到 $0$：**
	$$\frac{dX_t}{dt}=f(X_t,t)-\frac12g(t)^2s_t(X_t).$$

## Flow Matching：从噪声到数据的确定性运输

DDPM/NCSN 学习如何反转加噪过程；Flow Matching 直接学习时变速度场 $v_\theta(x,t)$，让样本沿 ODE 从噪声分布运输到数据分布：

$$
\frac{d\hat X_t}{dt}=v_\theta(\hat X_t,t),
\qquad \hat X_0\sim p_{\mathrm{noise}},\quad t\in[0,1].
$$

本节采用噪声在 $t=0$、数据在 $t=1$ 的记号；这与前面 DDPM 的时间方向相反。理解 Flow Matching 要分开三件事：选哪条中间概率路径、训练网络预测什么速度、最后用什么数值方法解 ODE。

### 线性参考路径与速度标签

从噪声分布抽 $Z\sim\mathcal N(0,I)$，从数据分布抽 $Y\sim p_{\mathrm{data}}$，构造端点间的线性插值：

$$
X_t=(1-t)Z+tY,
\qquad X_0=Z,\quad X_1=Y.
$$

这条参考路径的速度可以直接求出：

$$
\dot X_t=Y-Z.
$$

所以训练样本可以直接构造为“输入 $(X_t,t)$、标签 $Y-Z$”，不必先求解生成 ODE。对应的 conditional flow matching 损失是

$$
\mathcal L_{\mathrm{CFM}}(\theta)
=\mathbb E_{t,Z,Y}
\left\|v_\theta((1-t)Z+tY,t)-(Y-Z)\right\|^2.
$$

### 条件速度如何变成边缘速度

生成时只给定当前位置 $x$ 和时间 $t$，并不知道它原本配对的是哪一个 $(Z,Y)$。同一个 $(x,t)$ 可能由许多端点对经过，因此网络的 MSE 最优解是这些参考速度的后验平均：

$$
u_t(x)=\mathbb E[Y-Z\mid X_t=x].
$$

这就是边缘概率路径 $p_t$ 的速度场。条件路径也可写成：固定数据端点 $Y=y$ 时，$X_t\mid Y=y\sim\mathcal N(ty,(1-t)^2I)$；其条件速度为

$$
u_t(x\mid y)=\frac{y-x}{1-t},\qquad t<1.
$$

对端点的后验分布取平均，得到同一个 $u_t(x)=\mathbb E[u_t(X_t\mid Y)\mid X_t=x]$。因此 conditional flow matching 虽然用易算的条件速度作标签，学到的却是只依赖 $(x,t)$ 的边缘速度。

平方误差还满足

$$
\mathcal L_{\mathrm{CFM}}(\theta)
=\mathcal L_{\mathrm{FM}}(\theta)+C,
\qquad C\text{ 与 }\theta\text{ 无关},
$$

所以两种目标对网络参数有相同的总体梯度；不需要显式计算难求的边缘速度 $u_t$。

### 训练直线不等于生成轨迹

训练时，每一对 $(Z,Y)$ 定义一条直线，给出局部速度标签 $Y-Z$。但生成 ODE 在每个 $(x,t)$ 只能使用一个速度 $v_\theta(x,t)$；若多条参考直线经过同一时空点，网络会回归它们的条件平均。因此学到的生成轨迹可以弯曲，并不需要复现某一对训练端点的直线路径。

理想边缘速度满足连续性方程 $\partial_t p_t+\nabla\cdot(p_tu_t)=0$；从 $p_{\mathrm{noise}}$ 初始化并沿 $u_t$ 积分，ODE 就逐步搬运整个人群的分布到 $p_{\mathrm{data}}$。Flow Matching 匹配的是分布运输规律，不是训练样本的一一配对。
