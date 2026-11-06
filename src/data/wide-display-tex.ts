// 由 scripts/measure-display-widths.mjs 生成，请勿手工编辑。
// 手机上正文栏约 344px，下列公式的实际宽度超过它，渲染时改为左对齐。
// 共 65 条（去重后 257 条独立公式）。
// 测量页面：http://127.0.0.1:4321/zh/blog/rl-probability/、http://127.0.0.1:4321/en/blog/rl-probability/
const WIDE_DISPLAY_TEX = new Set<string>([
  "\\mathbb E[Y\\mid X=x]=\\mu_Y+\\Sigma_{YX}\\Sigma_{XX}^{-1}(x-\\mu_X),\n\\qquad\n\\operatorname{Var}(Y\\mid X=x)=\\Sigma_{YY}-\\Sigma_{YX}\\Sigma_{XX}^{-1}\\Sigma_{XY},", // 619px
  "\\Pr(X_{n+1}=j\\mid X_n=i,X_{n-1}=i_{n-1},\\ldots,X_0=i_0)\n=\n\\Pr(X_{n+1}=j\\mid X_n=i),", // 534px
  "\\mathbb P(X\\le k)=\\frac{k^2}{16},\\qquad\n\\mathbb P(X=k)=\\frac{k^2-(k-1)^2}{16}=\\frac{2k-1}{16},\\quad k=1,2,3,4.", // 529px
  "q_{ij}^{(2)}=\\sum_k \\Pr(X_2=j\\mid X_1=k)\\Pr(X_1=k\\mid X_0=i)=\\sum_k q_{ik}q_{kj}=(Q^2)_{ij},", // 524px
  "\\Pr(X_{t+1}=j\\mid X_t=i,X_{t-1}=i_{t-1},\\dots,X_0=i_0)=\\Pr(X_{t+1}=j\\mid X_t=i).", // 517px
  "\\langle U,V\\rangle=\\mathbb E[UV],\\qquad\n\\|U\\|_2=\\sqrt{\\mathbb E[U^2]},\\qquad\n\\|U-V\\|_2=\\sqrt{\\mathbb E[(U-V)^2]}.", // 512px
  "p_{t+1}=0.8p_t+0.3(1-p_t)=0.5p_t+0.3,\n\\qquad p_t-0.6=2^{-t}(p_0-0.6).", // 494px
  "\\Pr(X_3=1\\mid X_2=1)=q_{11}=\\frac14,\n\\qquad\n\\Pr(X_4=3\\mid X_3=2)=q_{23}=\\frac23.", // 491px
  "\\big|\\mathbb E[XY]\\big|\\le\\sqrt{\\mathbb E[X^2]\\,\\mathbb E[Y^2]},\\qquad\n|\\operatorname{Cov}(X,Y)|\\le\\sigma_X\\sigma_Y,\\qquad\n|\\rho_{XY}|\\le 1 ,", // 491px
  "f_{\\Theta\\mid X}(\\theta\\mid x)=\\frac{f_{X\\mid\\Theta}(x\\mid\\theta)\\,f_\\Theta(\\theta)}{f_X(x)},\\qquad f_X(x)=\\int f_{X\\mid\\Theta}(x\\mid\\theta)\\,f_\\Theta(\\theta)\\,d\\theta ,", // 487px
  "\\Theta\\mid S=s\\sim\\operatorname{Beta}(a+s,\\,b+n-s),\\qquad\n\\mathbb E[\\Theta\\mid S=s]=\\frac{a+s}{a+b+n}.", // 476px
  "\\operatorname{Var}(Y\\mid X)\n=\\mathbb E\\big[(Y-\\mathbb E[Y\\mid X])^2\\mid X\\big]\n=\\mathbb E[Y^2\\mid X]-\\big(\\mathbb E[Y\\mid X]\\big)^2.", // 475px
  "\\Pr(X_{n+1}=1,X_{n+2}=1\\mid D)\n=\\mathbb E[\\Theta^2\\mid D]\n=\\frac{A(A+1)}{(A+B)(A+B+1)},", // 468px
  "\\Pr(X_{\\text{new},1}=X_{\\text{new},2}=1\\mid D)=\\mathbb E[\\Theta^2\\mid D]=\\frac{A(A+1)}{(A+B)(A+B+1)},", // 467px
  "\\Pr(X_{\\text{new}}=1\\mid D)=\\int \\theta\\,p(\\theta\\mid D)\\,d\\theta=\\mathbb E[\\Theta\\mid D]=\\frac{a+s}{a+b+s+f}.", // 463px
  "V^{\\pi}(s)=\\mathbb E_{\\pi}\\!\\left[G_t\\mid S_t=s\\right],\\qquad\nQ^{\\pi}(s,a)=\\mathbb E_{\\pi}\\!\\left[G_t\\mid S_t=s,A_t=a\\right],", // 462px
  "\\Pr(X_{\\mathrm{new}}=1\\mid D)\n=\\int\\theta p(\\theta\\mid D)\\,d\\theta\n=\\mathbb E[\\Theta\\mid D]\n=\\frac{a+s}{a+b+s+f}.", // 460px
  "K=(\\Sigma_0^{-1}+n\\Sigma^{-1})^{-1},\n\\qquad\n\\boldsymbol\\mu\\mid x\\sim\n\\mathcal N\\!\\left(K(\\Sigma_0^{-1}\\boldsymbol\\mu_0+n\\Sigma^{-1}\\bar x),K\\right).", // 453px
  "\\operatorname{Cov}(X,Y)=\\mathbb E[(X-\\mathbb E[X])(Y-\\mathbb E[Y])]\n=\\mathbb E[XY]-\\mathbb E[X]\\mathbb E[Y].", // 450px
  "\\mathbb E[(\\Theta-a)^2\\mid X=x]\n=\\operatorname{Var}(\\Theta\\mid X=x)\n+\\bigl(a-\\mathbb E[\\Theta\\mid X=x]\\bigr)^2.", // 449px
  "\\mathbb E[\\Theta]=\\frac{B(a+1,b)}{B(a,b)}=\\frac{a}{a+b},\n\\qquad\n\\mathbb E[\\Theta^2]=\\frac{a(a+1)}{(a+b)(a+b+1)},", // 439px
  "f(x;\\mu,\\sigma^2)\n=\\frac1{\\sqrt{2\\pi\\sigma^2}}\n\\exp\\!\\left(-\\frac{(x-\\mu)^2}{2\\sigma^2}\\right),\n\\qquad \\mu\\in\\mathbb R,\\ \\sigma^2>0.", // 427px
  "\\Pr(X_i=x_i\\mid\\theta)=\\theta(1-\\theta)^{x_i-1},\n\\qquad L(\\theta)\\propto\\theta^n(1-\\theta)^{\\sum_i x_i-n},", // 426px
  "\\begin{aligned}\nq_{ij}^{(2)}\n&=\\sum_k\\Pr(X_2=j,X_1=k\\mid X_0=i)\\\\\n&=\\sum_k\\Pr(X_2=j\\mid X_1=k,X_0=i)\n\\Pr(X_1=k\\mid X_0=i)\\\\\n&=\\sum_k q_{ik}q_{kj}=(Q^2)_{ij}.\n\\end{aligned}", // 423px
  "\\Theta\\mid D\\sim\\operatorname{Beta}(a+s,b+f),\n\\qquad \\mathbb E[\\Theta\\mid D]=\\frac{a+s}{a+b+s+f}.", // 420px
  "\\Sigma\\mid x\\sim\\operatorname{InvWishart}\n\\left(\\nu_0+n,\nS_0+\\sum_i(x_i-\\boldsymbol\\mu)(x_i-\\boldsymbol\\mu)^\\top\\right).", // 419px
  "\\mathbb E[(Y-g(X))^2]\n=\\mathbb E[(Y-m(X))^2]+\\mathbb E[(m(X)-g(X))^2].", // 413px
  "|\\Sigma|^{-(\\nu_0+d+1)/2}\n\\exp\\!\\left[-\\tfrac12\\operatorname{tr}(S_0\\Sigma^{-1})\\right],\n\\qquad \\nu_0>d-1,\\ S_0\\succ0,", // 412px
  "\\mathbb E\\big[\\mathbb E[X\\mid Y]\\big]=\\mathbb E[X],\\qquad\n\\mathbb E\\big[\\mathbb E[X\\mid Y,Z]\\mid Y\\big]=\\mathbb E[X\\mid Y].", // 410px
  "\\mu_{n+1}(j)=\\sum_i\\mu_n(i)q_{ij},\n\\qquad \\mu_{n+1}=\\mu_nQ,\n\\qquad \\mu_n=\\mu_0Q^n.", // 406px
  "V^{\\pi}(s)=\\sum_{a}\\pi(a\\mid s)\\sum_{s'}p(s'\\mid s,a)\\Big[r(s,a,s')+\\gamma V^{\\pi}(s')\\Big].", // 406px
  "\\sum_{n=0}^{\\infty}(Q^n)_{ii}\n=\\mathbb E_i\\!\\left[\\sum_{n=0}^{\\infty}\\mathbf1\\{X_n=i\\}\\right]\n=\\begin{cases}\n1/(1-f_i),&f_i<1,\\\\\n\\infty,&f_i=1.\n\\end{cases}", // 405px
  "\\mathbb P(X\\ge a)\\le\\frac{\\mathbb E[X]}{a}\\quad (X\\ge 0),\\qquad\n\\mathbb P\\big(|X-\\mu|\\ge\\epsilon\\big)\\le\\frac{\\sigma^2}{\\epsilon^2}.", // 403px
  "\\mathbb E[Y\\mid X]\n=L[Y\\mid X]\n=\\mathbb E[Y]+\\frac{\\operatorname{Cov}(X,Y)}{\\operatorname{Var}(X)}(X-\\mathbb E[X]).", // 395px
  "\\frac{a+k}{a+b+n}\n=\\frac{a+b}{a+b+n}\\frac{a}{a+b}\n+\\frac{n}{a+b+n}\\frac{k}{n},\\qquad n>0.", // 395px
  "\\widehat\\theta_{\\mathrm{MAP}}=\n\\frac{a+k-1}{a+b+n-2}\n\\quad\\text{仅当 }a+k>1,\\ b+n-k>1.", // 394px
  "\\|\\mu-\\nu\\|_{\\mathrm{TV}}\n=\\frac12\\sum_x|\\mu(x)-\\nu(x)|\n=\\max_{A\\subseteq\\mathcal S}|\\mu(A)-\\nu(A)|.", // 393px
  "\\Pr(X_{\\mathrm{new},1}=X_{\\mathrm{new},2}=1\\mid D)\n=\\frac{8\\cdot9}{12\\cdot13}=\\frac6{13}\\ne\\left(\\frac23\\right)^2.", // 387px
  "\\mu_1=(0.8,0.2),\\qquad\n\\mu_2=(0.7,0.3),\\qquad\n\\pi=(0.6,0.4).", // 385px
  "\\mathbb E[Z\\,\\mathbf 1_{\\{Y\\in A\\}}]=\\mathbb E[X\\,\\mathbf 1_{\\{Y\\in A\\}}]\\quad\\text{for every measurable } A .", // 379px
  "L\\succeq M\\quad\\Longleftrightarrow\\quad\n\\alpha L+(1-\\alpha)N\\succeq\\alpha M+(1-\\alpha)N.", // 378px
  "\\mathbb E[X]=\\sum_x x\\,\\mathbb P(X=x),\n\\qquad\n\\mathbb E[X]=\\int_{-\\infty}^{\\infty}x f_X(x)\\,dx.", // 376px
  "\\begin{aligned}\n\\mathbb E\\big[\\mathbb E[Y\\mid X]\\big]\n&=\\int\\left[\\int y f_{Y\\mid X}(y\\mid x)\\,dy\\right]f_X(x)\\,dx\\\\\n&=\\iint y f_{X,Y}(x,y)\\,dy\\,dx\n=\\int y f_Y(y)\\,dy.\n\\end{aligned}", // 374px
  "f(x_i\\mid\\theta)=\\theta e^{-\\theta x_i}\\mathbf1\\{x_i\\ge0\\},\n\\qquad \\theta\\sim\\operatorname{Gamma}(a,b),", // 365px
  "\\mu_1=(0.8,0.2),\\qquad\n\\mu_2=(0.8,0.2)Q=(0.70,0.30).", // 364px
  "L(\\theta;x)=\\prod_{i=1}^{n}p(x_i;\\theta),\\qquad\n\\ell(\\theta;x)=\\sum_{i=1}^{n}\\log p(x_i;\\theta).", // 363px
  "d(t)=\\max_{\\mu_0}\\|\\mu_0Q^t-\\pi\\|_{\\mathrm{TV}}\n=\\max_x\\|Q^t(x,\\cdot)-\\pi\\|_{\\mathrm{TV}},", // 362px
  "\\mathbb E\\big[(Y-\\hat Y)\\,h(X)\\big]=0\\quad\\text{for all square-integrable } h .", // 362px
  "\\hat\\mu_n=\\frac1n\\sum_{i=1}^{n}X_i,\\qquad\n\\mathbb E[\\hat\\mu_n]=\\mu,\\qquad\n\\operatorname{Var}(\\hat\\mu_n)=\\frac{\\sigma^2}{n}.", // 360px
  "\\begin{aligned}\nD_{\\mathrm{KL}}(p\\|r)\n&=-\\mathbb E_p[\\log_2 Z]\\\\\n&\\ge-\\log_2\\mathbb E_p[Z]\n=-\\log_2\\!\\left(\\sum_{j:p_j>0}r_j\\right)\\ge0.\n\\end{aligned}", // 359px
  "T_i^+=\\inf\\{n\\ge1:X_n=i\\},\n\\qquad f_i=\\Pr_i(T_i^+<\\infty).", // 358px
  "v\\mid x\\sim\\operatorname{InvGamma}\\left(a+\\frac n2,\n\\ b+\\frac12\\sum_i(x_i-\\mu)^2\\right).", // 358px
  "f(x)=\\sum_{j=0}^{k}\\frac{f^{(j)}(a)}{j!}(x-a)^j\n+\\frac{f^{(k+1)}(\\xi)}{(k+1)!}(x-a)^{k+1}.", // 356px
  "Q=\\begin{pmatrix}\n1/4&1/2&1/4\\\\\n1/2&1/4&1/4\\\\\n1/4&1/4&1/2\n\\end{pmatrix},\\qquad\n\\pi=(1/3,1/3,1/3).", // 356px
  "\\operatorname{Var}(X+Y)=\\operatorname{Var}(X)+\\operatorname{Var}(Y)\n+2\\operatorname{Cov}(X,Y).", // 355px
  "\\mathbb E[\\Theta]=\\frac{a}{a+b},\\qquad\n\\operatorname{Var}(\\Theta)=\\frac{ab}{(a+b)^2(a+b+1)},", // 355px
  "\\begin{aligned}\n\\mathbb E[(Y-m(X))h(X)]\n&=\\mathbb E\\!\\left[h(X)\\mathbb E[Y-m(X)\\mid X]\\right]\\\\\n&=0.\n\\end{aligned}", // 354px
  "G_t=\\sum_{k=0}^{\\infty}\\gamma^{k}R_{t+k+1},\\qquad\n\\mathbb E[G_t]=\\sum_{k=0}^{\\infty}\\gamma^{k}\\,\\mathbb E[R_{t+k+1}],", // 353px
  "\\epsilon=\\sqrt{\\frac{(b-a)^2\\ln(1/\\delta)}{2n}},\\qquad\nn\\ge\\frac{(b-a)^2\\ln(1/\\delta)}{2\\epsilon^2}.", // 352px
  "\\mathbb E[X]=\\sum_x x\\,p_X(x),\\qquad \\mathbb E[X]=\\int_{-\\infty}^{\\infty}x\\,f_X(x)\\,dx ,", // 351px
  "f(\\boldsymbol\\theta)\n=\\frac{\\Gamma(\\sum_k\\alpha_k)}{\\prod_k\\Gamma(\\alpha_k)}\n\\prod_k\\theta_k^{\\alpha_k-1},\n\\quad \\theta_k>0,\\ \\sum_k\\theta_k=1.", // 350px
  "\\Pr(K_{\\mathrm{new}}=k\\mid D)\n=\\binom mk\\frac{B(A+k,B+m-k)}{B(A,B)}.", // 350px
  "Q_{\\mathrm{fast}}=\\begin{pmatrix}0.5&0.5\\\\0.5&0.5\\end{pmatrix},\n\\qquad\nQ_{\\mathrm{slow}}=\\begin{pmatrix}0.99&0.01\\\\0.01&0.99\\end{pmatrix}.", // 348px
  "d_{\\mathrm{TV}}(\\mu,\\nu)=\\tfrac12\\sum_i|\\mu_i-\\nu_i|=\\max_{A}|\\mu(A)-\\nu(A)| ,", // 347px
  "Z(\\text{警报}\\mid\\text{稳定})=0.1,\n\\qquad Z(\\text{警报}\\mid\\text{滑动})=0.8.", // 345px
]);

export { WIDE_DISPLAY_TEX };
