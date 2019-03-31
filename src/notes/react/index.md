---
date: "2019-03-31T00:00:00"
title: "Writing Resilient Components"
---
<p>When people start learning React, they often ask for a style guide. While it’s a good idea to have some consistent rules applied across a project, a lot of them are arbitrary — and so React doesn’t have a strong opinion about them.</p>
<p>You can use different type systems, prefer function declarations or arrow functions, sort your props in alphabetical order or in an order you find pleasing.</p>
<p>This flexibility allows <a href="https://reactjs.org/docs/add-react-to-a-website.html" target="_blank" rel="nofollow noopener noreferrer">integrating React</a> into projects with existing conventions. But it also invites endless debates.</p>
<p><strong>There <em>are</em> important design principles that every component should strive to follow. But I don’t think style guides capture those principles well. We’ll talk about style guides first, and then <a href="#writing-resilient-components">look at the principles that really <em>are</em> useful</a>.</strong></p>
<hr>
<h2 id="dont-get-distracted-by-imaginary-problems"><a href="#dont-get-distracted-by-imaginary-problems" aria-hidden="" class="anchor"></a>Don’t Get Distracted by Imaginary Problems</h2>
<p>Before we talk about component design principles, I want to say a few words about style guides. This isn’t a popular opinion but someone needs to say it!</p>
<p>In the JavaScript community, there are a few strict opinionated style guides enforced by a linter. My personal observation is that they tend to create more friction than they’re worth. I can’t count how many times somebody showed me some absolutely valid code and said “React complains about this”, but it was their lint config complaining! This leads to three issues:</p>
<ul>
<li>
<p>People get used to seeing the linter as an <strong>overzealous noisy gatekeeper</strong> rather than a helpful tool. Useful warnings are drowned out by a sea of style nits. As a result, people don’t scan the linter messages while debugging, and miss helpful tips. Additionally, people who are less used to writing JavaScript (for example, designers) have a harder time working with the code.</p>
</li>
<li>
<p>People don’t learn to <strong>differentiate between valid and invalid uses</strong> of a certain pattern. For example, there is a popular rule that forbids calling <code class="language-text">setState</code> inside <code class="language-text">componentDidMount</code>. But if it was always “bad”, React simply wouldn’t allow it! There is a legitimate use case for it, and that is to measure the DOM node layout — e.g. to position a tooltip. I’ve seen people “work around” this rule by adding a <code class="language-text">setTimeout</code> which completely misses the point.</p>
</li>
<li>
<p>Eventually, people adopt the “enforcer mindset” and get opinionated about things that <strong>don’t bring a meaningful difference</strong> but are easy to scan for in the code. “You used a function declaration, but <em>our</em> project uses arrow functions.” Whenever I have a strong feeling about enforcing a rule like this, looking deeper reveals that I invested emotional effort into this rule — and struggle to let it go. It lulls me into a false sense of accomplishment without improving my code.</p>
</li>
</ul>
<p>Am I saying that we should stop linting? Not at all!</p>
<p><strong>With a good config, a linter is a great tool to catch bugs before they happen.</strong> It’s focusing on the <em>style</em> too much that turns it into a distraction.</p>
<hr>
<h2 id="marie-kondo-your-lint-config"><a href="#marie-kondo-your-lint-config" aria-hidden="" class="anchor"></a>Marie Kondo Your Lint Config</h2>
<p>Here’s what I suggest you to do on Monday. Gather your team for half an hour, go through every lint rule enabled in your project’s config, and ask yourself: <em>“Has this rule ever helped us catch a bug?”</em> If not, <em>turn it off.</em> (You can also start from a clean slate with <a href="https://www.npmjs.com/package/eslint-config-react-app" target="_blank" rel="nofollow noopener noreferrer"><code class="language-text">eslint-config-react-app</code></a> which has no styling rules.)</p>
<p>At the very least, your team should have a process for removing rules that cause friction. Don’t assume that whatever you or something somebody else added to your lint config a year ago is a “best practice”. Question it and look for answers. Don’t let anyone tell you you’re not smart enough to pick your lint rules.</p>
<p><strong>But what about formatting?</strong> Use <a href="https://prettier.io/" target="_blank" rel="nofollow noopener noreferrer">Prettier</a> and forget about the “style nits”. You don’t need a tool to shout at you for putting an extra space if another tool can fix it for you. Use the linter to find <em>bugs</em>, not enforcing the <em>a e s t h e t i c s</em>.</p>
<p>Of course, there are aspects of the coding style that aren’t directly related to formatting but can still be annoying when inconsistent across the project.</p>
<p>However, many of them are too subtle to catch with a lint rule anyway. This is why it’s important to <strong>build trust</strong> between the team members, and to share useful learnings in the form of a wiki page or a short design guide.</p>
<p>Not everything is worth automating! The insights gained from <em>actually reading</em> the rationale in such a guide can be more valuable than following the “rules”.</p>
<p><strong>But if following a strict style guide is a distraction, what’s actually important?</strong></p>
<p>That’s the topic of this post.</p>
<hr>
<h2 id="writing-resilient-components"><a href="#writing-resilient-components" aria-hidden="" class="anchor"></a>Writing Resilient Components</h2>
<p>No amount of indentation or sorting imports alphabetically can fix a broken design. So instead of focusing on how some code <em>looks</em>, I will focus on how it <em>works</em>. There’s a few component design principles that I find very helpful:</p>
<ol>
<li><strong><a href="#principle-1-dont-stop-the-data-flow">Don’t stop the data flow</a></strong></li>
<li><strong><a href="#principle-2-always-be-ready-to-render">Always be ready to render</a></strong></li>
<li><strong><a href="#principle-3-no-component-is-a-singleton">No component is a singleton</a></strong></li>
<li><strong><a href="#principle-4-keep-the-local-state-isolated">Keep the local state isolated</a></strong></li>
</ol>
<p>Even if you don’t use React, you’ll likely discover the same principles by trial and error for any UI component model with unidirectional data flow.</p>
<hr>
<h2 id="principle-1-dont-stop-the-data-flow"><a href="#principle-1-dont-stop-the-data-flow" aria-hidden="" class="anchor"></a>Principle 1: Don’t Stop the Data Flow</h2>
<h3 id="dont-stop-the-data-flow-in-rendering"><a href="#dont-stop-the-data-flow-in-rendering" aria-hidden="" class="anchor"></a>Don’t Stop the Data Flow in Rendering</h3>
<p>When somebody uses your component, they expect that they can pass different props to it over time, and that the component will reflect those changes:</p>
<div class="gatsby-highlight" data-language="jsx"><pre class="language-jsx"><code class="language-jsx"><span class="token comment">// isOk might be driven by state and can change at any time</span>
<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>Button</span> <span class="token attr-name">color</span><span class="token script language-javascript"><span class="token script-punctuation punctuation">=</span><span class="token punctuation">{</span>isOk <span class="token operator">?</span> <span class="token string">'blue'</span> <span class="token punctuation">:</span> <span class="token string">'red'</span><span class="token punctuation">}</span></span> <span class="token punctuation">/&gt;</span></span></code></pre></div>
<p>In general, this is how React works by default. If you use a <code class="language-text">color</code> prop inside a <code class="language-text">Button</code> component, you’ll see the value provided from above for that render:</p>
<div class="gatsby-highlight" data-language="jsx"><pre class="language-jsx"><code class="language-jsx"><span class="token keyword">function</span> <span class="token function">Button</span><span class="token punctuation">(</span><span class="token punctuation">{</span> color<span class="token punctuation">,</span> children <span class="token punctuation">}</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
  <span class="token keyword">return</span> <span class="token punctuation">(</span>
    <span class="token comment">// ✅ `color` is always fresh!</span>
    <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>button</span> <span class="token attr-name">className</span><span class="token script language-javascript"><span class="token script-punctuation punctuation">=</span><span class="token punctuation">{</span><span class="token string">'Button-'</span> <span class="token operator">+</span> color<span class="token punctuation">}</span></span><span class="token punctuation">&gt;</span></span><span class="token plain-text">
      </span><span class="token punctuation">{</span>children<span class="token punctuation">}</span><span class="token plain-text">
    </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>button</span><span class="token punctuation">&gt;</span></span>
  <span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span></code></pre></div>
<p>However, a common mistake when learning React is to copy props into state:</p>
<div class="gatsby-highlight" data-language="jsx"><pre class="language-jsx"><code class="language-jsx"><span class="token keyword">class</span> <span class="token class-name">Button</span> <span class="token keyword">extends</span> <span class="token class-name">React<span class="token punctuation">.</span>Component</span> <span class="token punctuation">{</span>
  state <span class="token operator">=</span> <span class="token punctuation">{</span>
<span class="gatsby-highlight-code-line">    color<span class="token punctuation">:</span> <span class="token keyword">this</span><span class="token punctuation">.</span>props<span class="token punctuation">.</span>color</span>  <span class="token punctuation">}</span><span class="token punctuation">;</span>
  <span class="token function">render</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
<span class="gatsby-highlight-code-line">    <span class="token keyword">const</span> <span class="token punctuation">{</span> color <span class="token punctuation">}</span> <span class="token operator">=</span> <span class="token keyword">this</span><span class="token punctuation">.</span>state<span class="token punctuation">;</span> <span class="token comment">// 🔴 `color` is stale!</span></span>    <span class="token keyword">return</span> <span class="token punctuation">(</span>
      <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>button</span> <span class="token attr-name">className</span><span class="token script language-javascript"><span class="token script-punctuation punctuation">=</span><span class="token punctuation">{</span><span class="token string">'Button-'</span> <span class="token operator">+</span> color<span class="token punctuation">}</span></span><span class="token punctuation">&gt;</span></span><span class="token plain-text"></span>
<span class="token plain-text">        </span><span class="token punctuation">{</span><span class="token keyword">this</span><span class="token punctuation">.</span>props<span class="token punctuation">.</span>children<span class="token punctuation">}</span><span class="token plain-text"></span>
<span class="token plain-text">      </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>button</span><span class="token punctuation">&gt;</span></span>
    <span class="token punctuation">)</span><span class="token punctuation">;</span>
  <span class="token punctuation">}</span>
<span class="token punctuation">}</span></code></pre></div>
<p>This might seem more intuitive at first if you used classes outside of React. <strong>However, by copying a prop into state you’re ignoring all updates to it.</strong></p>
<div class="gatsby-highlight" data-language="jsx"><pre class="language-jsx"><code class="language-jsx"><span class="token comment">// 🔴 No longer works for updates with the above implementation</span>
<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>Button</span> <span class="token attr-name">color</span><span class="token script language-javascript"><span class="token script-punctuation punctuation">=</span><span class="token punctuation">{</span>isOk <span class="token operator">?</span> <span class="token string">'blue'</span> <span class="token punctuation">:</span> <span class="token string">'red'</span><span class="token punctuation">}</span></span> <span class="token punctuation">/&gt;</span></span></code></pre></div>
<p>In the rare case that this behavior <em>is</em> intentional, make sure to call that prop <code class="language-text">initialColor</code> or <code class="language-text">defaultColor</code> to clarify that changes to it are ignored.</p>
<p>But usually you’ll want to <strong>read the props directly in your component</strong> and avoid copying props (or anything computed from the props) into state:</p>
<div class="gatsby-highlight" data-language="jsx"><pre class="language-jsx"><code class="language-jsx"><span class="token keyword">function</span> <span class="token function">Button</span><span class="token punctuation">(</span><span class="token punctuation">{</span> color<span class="token punctuation">,</span> children <span class="token punctuation">}</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
  <span class="token keyword">return</span> <span class="token punctuation">(</span>
    <span class="token comment">// ✅ `color` is always fresh!</span>
    <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>button</span> <span class="token attr-name">className</span><span class="token script language-javascript"><span class="token script-punctuation punctuation">=</span><span class="token punctuation">{</span><span class="token string">'Button-'</span> <span class="token operator">+</span> color<span class="token punctuation">}</span></span><span class="token punctuation">&gt;</span></span><span class="token plain-text">
      </span><span class="token punctuation">{</span>children<span class="token punctuation">}</span><span class="token plain-text">
    </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>button</span><span class="token punctuation">&gt;</span></span>
  <span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span></code></pre></div>
<hr>
<p>Computed values are another reason people sometimes attempt to copy props into state. For example, imagine that we determined the <em>button text</em> color based on an expensive computation with background <code class="language-text">color</code> as an argument: </p>
<div class="gatsby-highlight" data-language="jsx"><pre class="language-jsx"><code class="language-jsx"><span class="token keyword">class</span> <span class="token class-name">Button</span> <span class="token keyword">extends</span> <span class="token class-name">React<span class="token punctuation">.</span>Component</span> <span class="token punctuation">{</span>
  state <span class="token operator">=</span> <span class="token punctuation">{</span>
<span class="gatsby-highlight-code-line">    textColor<span class="token punctuation">:</span> <span class="token function">slowlyCalculateTextColor</span><span class="token punctuation">(</span><span class="token keyword">this</span><span class="token punctuation">.</span>props<span class="token punctuation">.</span>color<span class="token punctuation">)</span></span>  <span class="token punctuation">}</span><span class="token punctuation">;</span>
  <span class="token function">render</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">return</span> <span class="token punctuation">(</span>
      <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>button</span> <span class="token attr-name">className</span><span class="token script language-javascript"><span class="token script-punctuation punctuation">=</span><span class="token punctuation">{</span>
        <span class="token string">'Button-'</span> <span class="token operator">+</span> <span class="token keyword">this</span><span class="token punctuation">.</span>props<span class="token punctuation">.</span>color <span class="token operator">+</span>
<span class="gatsby-highlight-code-line">        <span class="token string">' Button-text-'</span> <span class="token operator">+</span> <span class="token keyword">this</span><span class="token punctuation">.</span>state<span class="token punctuation">.</span>textColor <span class="token comment">// 🔴 Stale on `color` prop updates</span></span>      <span class="token punctuation">}</span></span><span class="token punctuation">&gt;</span></span><span class="token plain-text"></span>
<span class="token plain-text">        </span><span class="token punctuation">{</span><span class="token keyword">this</span><span class="token punctuation">.</span>props<span class="token punctuation">.</span>children<span class="token punctuation">}</span><span class="token plain-text"></span>
<span class="token plain-text">      </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>button</span><span class="token punctuation">&gt;</span></span>
    <span class="token punctuation">)</span><span class="token punctuation">;</span>
  <span class="token punctuation">}</span>
<span class="token punctuation">}</span></code></pre></div>
<p>This component is buggy because it doesn’t recalculate <code class="language-text">this.state.textColor</code> on the <code class="language-text">color</code> prop change. The easiest fix would be to move the <code class="language-text">textColor</code> calculation into the <code class="language-text">render</code> method, and make this a <code class="language-text">PureComponent</code>:</p>
<div class="gatsby-highlight" data-language="jsx"><pre class="language-jsx"><code class="language-jsx"><span class="gatsby-highlight-code-line"><span class="token keyword">class</span> <span class="token class-name">Button</span> <span class="token keyword">extends</span> <span class="token class-name">React<span class="token punctuation">.</span>PureComponent</span> <span class="token punctuation">{</span></span>  <span class="token function">render</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
<span class="gatsby-highlight-code-line">    <span class="token keyword">const</span> textColor <span class="token operator">=</span> <span class="token function">slowlyCalculateTextColor</span><span class="token punctuation">(</span><span class="token keyword">this</span><span class="token punctuation">.</span>props<span class="token punctuation">.</span>color<span class="token punctuation">)</span><span class="token punctuation">;</span></span>    <span class="token keyword">return</span> <span class="token punctuation">(</span>
      <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>button</span> <span class="token attr-name">className</span><span class="token script language-javascript"><span class="token script-punctuation punctuation">=</span><span class="token punctuation">{</span>
        <span class="token string">'Button-'</span> <span class="token operator">+</span> <span class="token keyword">this</span><span class="token punctuation">.</span>props<span class="token punctuation">.</span>color <span class="token operator">+</span>
        <span class="token string">' Button-text-'</span> <span class="token operator">+</span> textColor <span class="token comment">// ✅ Always fresh</span>
      <span class="token punctuation">}</span></span><span class="token punctuation">&gt;</span></span><span class="token plain-text"></span>
<span class="token plain-text">        </span><span class="token punctuation">{</span><span class="token keyword">this</span><span class="token punctuation">.</span>props<span class="token punctuation">.</span>children<span class="token punctuation">}</span><span class="token plain-text"></span>
<span class="token plain-text">      </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>button</span><span class="token punctuation">&gt;</span></span>
    <span class="token punctuation">)</span><span class="token punctuation">;</span>
  <span class="token punctuation">}</span>
<span class="token punctuation">}</span></code></pre></div>
<p>Problem solved! Now if props change, we’ll recalculate <code class="language-text">textColor</code>, but we avoid the expensive computation on the same props.</p>
<p>However, we might want to optimize it further. What if it’s the <code class="language-text">children</code> prop that changed? It seems unfortunate to recalculate the <code class="language-text">textColor</code> in that case. Our second attempt might be to invoke the calculation in <code class="language-text">componentDidUpdate</code>:</p>
<div class="gatsby-highlight" data-language="jsx"><pre class="language-jsx"><code class="language-jsx"><span class="token keyword">class</span> <span class="token class-name">Button</span> <span class="token keyword">extends</span> <span class="token class-name">React<span class="token punctuation">.</span>Component</span> <span class="token punctuation">{</span>
  state <span class="token operator">=</span> <span class="token punctuation">{</span>
    textColor<span class="token punctuation">:</span> <span class="token function">slowlyCalculateTextColor</span><span class="token punctuation">(</span><span class="token keyword">this</span><span class="token punctuation">.</span>props<span class="token punctuation">.</span>color<span class="token punctuation">)</span>
  <span class="token punctuation">}</span><span class="token punctuation">;</span>
<span class="gatsby-highlight-code-line">  <span class="token function">componentDidUpdate</span><span class="token punctuation">(</span>prevProps<span class="token punctuation">)</span> <span class="token punctuation">{</span></span><span class="gatsby-highlight-code-line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>prevProps<span class="token punctuation">.</span>color <span class="token operator">!==</span> <span class="token keyword">this</span><span class="token punctuation">.</span>props<span class="token punctuation">.</span>color<span class="token punctuation">)</span> <span class="token punctuation">{</span></span><span class="gatsby-highlight-code-line">      <span class="token comment">// 😔 Extra re-render for every update</span></span><span class="gatsby-highlight-code-line">      <span class="token keyword">this</span><span class="token punctuation">.</span><span class="token function">setState</span><span class="token punctuation">(</span><span class="token punctuation">{</span></span><span class="gatsby-highlight-code-line">        textColor<span class="token punctuation">:</span> <span class="token function">slowlyCalculateTextColor</span><span class="token punctuation">(</span><span class="token keyword">this</span><span class="token punctuation">.</span>props<span class="token punctuation">.</span>color<span class="token punctuation">)</span><span class="token punctuation">,</span></span><span class="gatsby-highlight-code-line">      <span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span><span class="gatsby-highlight-code-line">    <span class="token punctuation">}</span></span><span class="gatsby-highlight-code-line">  <span class="token punctuation">}</span></span>  <span class="token function">render</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">return</span> <span class="token punctuation">(</span>
      <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>button</span> <span class="token attr-name">className</span><span class="token script language-javascript"><span class="token script-punctuation punctuation">=</span><span class="token punctuation">{</span>
        <span class="token string">'Button-'</span> <span class="token operator">+</span> <span class="token keyword">this</span><span class="token punctuation">.</span>props<span class="token punctuation">.</span>color <span class="token operator">+</span>
        <span class="token string">' Button-text-'</span> <span class="token operator">+</span> <span class="token keyword">this</span><span class="token punctuation">.</span>state<span class="token punctuation">.</span>textColor <span class="token comment">// ✅ Fresh on final render</span>
      <span class="token punctuation">}</span></span><span class="token punctuation">&gt;</span></span><span class="token plain-text"></span>
<span class="token plain-text">        </span><span class="token punctuation">{</span><span class="token keyword">this</span><span class="token punctuation">.</span>props<span class="token punctuation">.</span>children<span class="token punctuation">}</span><span class="token plain-text"></span>
<span class="token plain-text">      </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>button</span><span class="token punctuation">&gt;</span></span>
    <span class="token punctuation">)</span><span class="token punctuation">;</span>
  <span class="token punctuation">}</span>
<span class="token punctuation">}</span></code></pre></div>
<p>However, this would mean our component does a second re-render after every change. That’s not ideal either if we’re trying to optimize it.</p>
<p>You could use the legacy <code class="language-text">componentWillReceiveProps</code> lifecycle for this. However, people often put side effects there too. That, in turn, often causes problems for the upcoming Concurrent Rendering <a href="https://reactjs.org/blog/2018/03/01/sneak-peek-beyond-react-16.html" target="_blank" rel="nofollow noopener noreferrer">features like Time Slicing and Suspense</a>. And the “safer” <code class="language-text">getDerivedStateFromProps</code> method is clunky.</p>
<p>Let’s step back for a second. Effectively, we want <a href="https://en.wikipedia.org/wiki/Memoization" target="_blank" rel="nofollow noopener noreferrer"><em>memoization</em></a>. We have some inputs, and we don’t want to recalculate the output unless the inputs change.</p>
<p>With a class, you could use a <a href="https://reactjs.org/blog/2018/06/07/you-probably-dont-need-derived-state.html#what-about-memoization" target="_blank" rel="nofollow noopener noreferrer">helper</a> for memoization. However, Hooks take this a step further, giving you a built-in way to memoize expensive computations:</p>
<div class="gatsby-highlight" data-language="jsx"><pre class="language-jsx"><code class="language-jsx"><span class="token keyword">function</span> <span class="token function">Button</span><span class="token punctuation">(</span><span class="token punctuation">{</span> color<span class="token punctuation">,</span> children <span class="token punctuation">}</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
<span class="gatsby-highlight-code-line">  <span class="token keyword">const</span> textColor <span class="token operator">=</span> <span class="token function">useMemo</span><span class="token punctuation">(</span></span><span class="gatsby-highlight-code-line">    <span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token function">slowlyCalculateTextColor</span><span class="token punctuation">(</span>color<span class="token punctuation">)</span><span class="token punctuation">,</span></span><span class="gatsby-highlight-code-line">    <span class="token punctuation">[</span>color<span class="token punctuation">]</span> <span class="token comment">// ✅ Don’t recalculate until `color` changes</span></span><span class="gatsby-highlight-code-line">  <span class="token punctuation">)</span><span class="token punctuation">;</span></span>  <span class="token keyword">return</span> <span class="token punctuation">(</span>
    <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>button</span> <span class="token attr-name">className</span><span class="token script language-javascript"><span class="token script-punctuation punctuation">=</span><span class="token punctuation">{</span><span class="token string">'Button-'</span> <span class="token operator">+</span> color <span class="token operator">+</span> <span class="token string">' Button-text-'</span> <span class="token operator">+</span> textColor<span class="token punctuation">}</span></span><span class="token punctuation">&gt;</span></span><span class="token plain-text"></span>
<span class="token plain-text">      </span><span class="token punctuation">{</span>children<span class="token punctuation">}</span><span class="token plain-text"></span>
<span class="token plain-text">    </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>button</span><span class="token punctuation">&gt;</span></span>
  <span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span></code></pre></div>
<p>That’s all the code you need!</p>
<p>In a class component, you can use a helper like <a href="https://github.com/alexreardon/memoize-one" target="_blank" rel="nofollow noopener noreferrer"><code class="language-text">memoize-one</code></a> for that. In a function component, <code class="language-text">useMemo</code> Hook gives you similar functionality.</p>
<p>Now we see that <strong>even optimizing expensive computations isn’t a good reason to copy props into state.</strong> Our rendering result should respect changes to props.</p>
<hr>
<h3 id="dont-stop-the-data-flow-in-side-effects"><a href="#dont-stop-the-data-flow-in-side-effects" aria-hidden="" class="anchor"></a>Don’t Stop the Data Flow in Side Effects</h3>
<p>So far, we’ve talked about how to keep the rendering result consistent with prop changes. Avoiding copying props into state is a part of that. However, it is important that <strong>side effects (e.g. data fetching) are also a part of the data flow</strong>.</p>
<p>Consider this React component:</p>
<div class="gatsby-highlight" data-language="jsx"><pre class="language-jsx"><code class="language-jsx"><span class="token keyword">class</span> <span class="token class-name">SearchResults</span> <span class="token keyword">extends</span> <span class="token class-name">React<span class="token punctuation">.</span>Component</span> <span class="token punctuation">{</span>
  state <span class="token operator">=</span> <span class="token punctuation">{</span>
    data<span class="token punctuation">:</span> <span class="token keyword">null</span>
  <span class="token punctuation">}</span><span class="token punctuation">;</span>
<span class="gatsby-highlight-code-line">  <span class="token function">componentDidMount</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span><span class="gatsby-highlight-code-line">    <span class="token keyword">this</span><span class="token punctuation">.</span><span class="token function">fetchResults</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span><span class="gatsby-highlight-code-line">  <span class="token punctuation">}</span></span>  <span class="token function">fetchResults</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">const</span> url <span class="token operator">=</span> <span class="token keyword">this</span><span class="token punctuation">.</span><span class="token function">getFetchUrl</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token comment">// Do the fetching...</span>
  <span class="token punctuation">}</span>
  <span class="token function">getFetchUrl</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">return</span> <span class="token string">'http://myapi/results?query'</span> <span class="token operator">+</span> <span class="token keyword">this</span><span class="token punctuation">.</span>props<span class="token punctuation">.</span>query<span class="token punctuation">;</span>
  <span class="token punctuation">}</span>
  <span class="token function">render</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token comment">// ...</span>
  <span class="token punctuation">}</span>
<span class="token punctuation">}</span></code></pre></div>
<p>A lot of React components are like this — but if we look a bit closer, we’ll notice a bug. The <code class="language-text">fetchResults</code> method uses the <code class="language-text">query</code> prop for data fetching:</p>
<div class="gatsby-highlight" data-language="jsx"><pre class="language-jsx"><code class="language-jsx">  <span class="token function">getFetchUrl</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
<span class="gatsby-highlight-code-line">    <span class="token keyword">return</span> <span class="token string">'http://myapi/results?query'</span> <span class="token operator">+</span> <span class="token keyword">this</span><span class="token punctuation">.</span>props<span class="token punctuation">.</span>query<span class="token punctuation">;</span></span>  <span class="token punctuation">}</span></code></pre></div>
<p>But what if the <code class="language-text">query</code> prop changes? In our component, nothing will happen. <strong>This means our component’s side effects don’t respect changes to its props.</strong> This is a very common source of bugs in React applications.</p>
<p>In order to fix our component, we need to:</p>
<ul>
<li>
Look at <code class="language-text">componentDidMount</code> and every method called from it.
<ul>
<li>In our example, that’s <code class="language-text">fetchResults</code> and <code class="language-text">getFetchUrl</code>.</li>
</ul>
</li>
<li>
Write down all props and state used by those methods.
<ul>
<li>In our example, that’s <code class="language-text">this.props.query</code>.</li>
</ul>
</li>
<li>
Make sure that whenever those props change, we re-run the side effect.
<ul>
<li>We can do this by adding the <code class="language-text">componentDidUpdate</code> method.</li>
</ul>
</li>
</ul>
<div class="gatsby-highlight" data-language="jsx"><pre class="language-jsx"><code class="language-jsx"><span class="token keyword">class</span> <span class="token class-name">SearchResults</span> <span class="token keyword">extends</span> <span class="token class-name">React<span class="token punctuation">.</span>Component</span> <span class="token punctuation">{</span>
  state <span class="token operator">=</span> <span class="token punctuation">{</span>
    data<span class="token punctuation">:</span> <span class="token keyword">null</span>
  <span class="token punctuation">}</span><span class="token punctuation">;</span>
  <span class="token function">componentDidMount</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">this</span><span class="token punctuation">.</span><span class="token function">fetchResults</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
  <span class="token punctuation">}</span>
<span class="gatsby-highlight-code-line">  <span class="token function">componentDidUpdate</span><span class="token punctuation">(</span>prevProps<span class="token punctuation">)</span> <span class="token punctuation">{</span></span><span class="gatsby-highlight-code-line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>prevProps<span class="token punctuation">.</span>query <span class="token operator">!==</span> <span class="token keyword">this</span><span class="token punctuation">.</span>props<span class="token punctuation">.</span>query<span class="token punctuation">)</span> <span class="token punctuation">{</span> <span class="token comment">// ✅ Refetch on change</span></span><span class="gatsby-highlight-code-line">      <span class="token keyword">this</span><span class="token punctuation">.</span><span class="token function">fetchResults</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span><span class="gatsby-highlight-code-line">    <span class="token punctuation">}</span></span><span class="gatsby-highlight-code-line">  <span class="token punctuation">}</span></span>  <span class="token function">fetchResults</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">const</span> url <span class="token operator">=</span> <span class="token keyword">this</span><span class="token punctuation">.</span><span class="token function">getFetchUrl</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token comment">// Do the fetching...</span>
  <span class="token punctuation">}</span>
  <span class="token function">getFetchUrl</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
<span class="gatsby-highlight-code-line">    <span class="token keyword">return</span> <span class="token string">'http://myapi/results?query'</span> <span class="token operator">+</span> <span class="token keyword">this</span><span class="token punctuation">.</span>props<span class="token punctuation">.</span>query<span class="token punctuation">;</span> <span class="token comment">// ✅ Updates are handled</span></span>  <span class="token punctuation">}</span>
  <span class="token function">render</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token comment">// ...</span>
  <span class="token punctuation">}</span>
<span class="token punctuation">}</span></code></pre></div>
<p>Now our code respects all changes to props, even for side effects.</p>
<p>However, it’s challenging to remember not to break it again. For example, we might add <code class="language-text">currentPage</code> to the local state, and use it in <code class="language-text">getFetchUrl</code>:</p>
<div class="gatsby-highlight" data-language="jsx"><pre class="language-jsx"><code class="language-jsx"><span class="token keyword">class</span> <span class="token class-name">SearchResults</span> <span class="token keyword">extends</span> <span class="token class-name">React<span class="token punctuation">.</span>Component</span> <span class="token punctuation">{</span>
  state <span class="token operator">=</span> <span class="token punctuation">{</span>
    data<span class="token punctuation">:</span> <span class="token keyword">null</span><span class="token punctuation">,</span>
<span class="gatsby-highlight-code-line">    currentPage<span class="token punctuation">:</span> <span class="token number">0</span><span class="token punctuation">,</span></span>  <span class="token punctuation">}</span><span class="token punctuation">;</span>
  <span class="token function">componentDidMount</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">this</span><span class="token punctuation">.</span><span class="token function">fetchResults</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
  <span class="token punctuation">}</span>
  <span class="token function">componentDidUpdate</span><span class="token punctuation">(</span>prevProps<span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>prevProps<span class="token punctuation">.</span>query <span class="token operator">!==</span> <span class="token keyword">this</span><span class="token punctuation">.</span>props<span class="token punctuation">.</span>query<span class="token punctuation">)</span> <span class="token punctuation">{</span>
      <span class="token keyword">this</span><span class="token punctuation">.</span><span class="token function">fetchResults</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
  <span class="token punctuation">}</span>
  <span class="token function">fetchResults</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">const</span> url <span class="token operator">=</span> <span class="token keyword">this</span><span class="token punctuation">.</span><span class="token function">getFetchUrl</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token comment">// Do the fetching...</span>
  <span class="token punctuation">}</span>
  <span class="token function">getFetchUrl</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">return</span> <span class="token punctuation">(</span>
      <span class="token string">'http://myapi/results?query'</span> <span class="token operator">+</span> <span class="token keyword">this</span><span class="token punctuation">.</span>props<span class="token punctuation">.</span>query <span class="token operator">+</span>
<span class="gatsby-highlight-code-line">      <span class="token string">'&amp;page='</span> <span class="token operator">+</span> <span class="token keyword">this</span><span class="token punctuation">.</span>state<span class="token punctuation">.</span>currentPage <span class="token comment">// 🔴 Updates are ignored</span></span>    <span class="token punctuation">)</span><span class="token punctuation">;</span>
  <span class="token punctuation">}</span>
  <span class="token function">render</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token comment">// ...</span>
  <span class="token punctuation">}</span>
<span class="token punctuation">}</span></code></pre></div>
<p>Alas, our code is again buggy because our side effect doesn’t respect changes to <code class="language-text">currentPage</code>.</p>
<p><strong>Props and state are a part of the React data flow. Both rendering and side effects should reflect changes in that data flow, not ignore them!</strong></p>
<p>To fix our code, we can repeat the steps above:</p>
<ul>
<li>
<p>Look at <code class="language-text">componentDidMount</code> and every method called from it.</p>
<ul>
<li>In our example, that’s <code class="language-text">fetchResults</code> and <code class="language-text">getFetchUrl</code>.</li>
</ul>
</li>
<li>
<p>Write down all props and state used by those methods.</p>
<ul>
<li>In our example, that’s <code class="language-text">this.props.query</code> <strong>and <code class="language-text">this.state.currentPage</code></strong>.</li>
</ul>
</li>
<li>
<p>Make sure that whenever those props change, we re-run the side effect.</p>
<ul>
<li>We can do this by changing the <code class="language-text">componentDidUpdate</code> method.</li>
</ul>
</li>
</ul>
<p>Let’s fix our component to handle updates to the <code class="language-text">currentPage</code> state:</p>
<div class="gatsby-highlight" data-language="jsx"><pre class="language-jsx"><code class="language-jsx"><span class="token keyword">class</span> <span class="token class-name">SearchResults</span> <span class="token keyword">extends</span> <span class="token class-name">React<span class="token punctuation">.</span>Component</span> <span class="token punctuation">{</span>
  state <span class="token operator">=</span> <span class="token punctuation">{</span>
    data<span class="token punctuation">:</span> <span class="token keyword">null</span><span class="token punctuation">,</span>
    currentPage<span class="token punctuation">:</span> <span class="token number">0</span><span class="token punctuation">,</span>
  <span class="token punctuation">}</span><span class="token punctuation">;</span>
  <span class="token function">componentDidMount</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">this</span><span class="token punctuation">.</span><span class="token function">fetchResults</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
  <span class="token punctuation">}</span>
  <span class="token function">componentDidUpdate</span><span class="token punctuation">(</span>prevProps<span class="token punctuation">,</span> prevState<span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>
<span class="gatsby-highlight-code-line">      prevState<span class="token punctuation">.</span>currentPage <span class="token operator">!==</span> <span class="token keyword">this</span><span class="token punctuation">.</span>state<span class="token punctuation">.</span>currentPage <span class="token operator">||</span> <span class="token comment">// ✅ Refetch on change</span></span>      prevProps<span class="token punctuation">.</span>query <span class="token operator">!==</span> <span class="token keyword">this</span><span class="token punctuation">.</span>props<span class="token punctuation">.</span>query
    <span class="token punctuation">)</span> <span class="token punctuation">{</span>
      <span class="token keyword">this</span><span class="token punctuation">.</span><span class="token function">fetchResults</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
  <span class="token punctuation">}</span>
  <span class="token function">fetchResults</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">const</span> url <span class="token operator">=</span> <span class="token keyword">this</span><span class="token punctuation">.</span><span class="token function">getFetchUrl</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token comment">// Do the fetching...</span>
  <span class="token punctuation">}</span>
  <span class="token function">getFetchUrl</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">return</span> <span class="token punctuation">(</span>
      <span class="token string">'http://myapi/results?query'</span> <span class="token operator">+</span> <span class="token keyword">this</span><span class="token punctuation">.</span>props<span class="token punctuation">.</span>query <span class="token operator">+</span>
<span class="gatsby-highlight-code-line">      <span class="token string">'&amp;page='</span> <span class="token operator">+</span> <span class="token keyword">this</span><span class="token punctuation">.</span>state<span class="token punctuation">.</span>currentPage <span class="token comment">// ✅ Updates are handled</span></span>    <span class="token punctuation">)</span><span class="token punctuation">;</span>
  <span class="token punctuation">}</span>
  <span class="token function">render</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token comment">// ...</span>
  <span class="token punctuation">}</span>
<span class="token punctuation">}</span></code></pre></div>
<p><strong>Wouldn’t it be nice if we could somehow automatically catch these mistakes?</strong> Isn’t that something a linter could help us with?</p>
<hr>
<p>Unfortunately, automatically checking a class component for consistency is too difficult. Any method can call any other method. Statically analyzing calls from <code class="language-text">componentDidMount</code> and <code class="language-text">componentDidUpdate</code> is fraught with false positives.</p>
<p>However, one <em>could</em> design an API that <em>can</em> be statically analyzed for consistency. The <a href="/a-complete-guide-to-useeffect/">React <code class="language-text">useEffect</code> Hook</a> is an example of such API:</p>
<div class="gatsby-highlight" data-language="jsx"><pre class="language-jsx"><code class="language-jsx"><span class="token keyword">function</span> <span class="token function">SearchResults</span><span class="token punctuation">(</span><span class="token punctuation">{</span> query <span class="token punctuation">}</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
  <span class="token keyword">const</span> <span class="token punctuation">[</span>data<span class="token punctuation">,</span> setData<span class="token punctuation">]</span> <span class="token operator">=</span> <span class="token function">useState</span><span class="token punctuation">(</span><span class="token keyword">null</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
  <span class="token keyword">const</span> <span class="token punctuation">[</span>currentPage<span class="token punctuation">,</span> setCurrentPage<span class="token punctuation">]</span> <span class="token operator">=</span> <span class="token function">useState</span><span class="token punctuation">(</span><span class="token number">0</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

  <span class="token function">useEffect</span><span class="token punctuation">(</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span>
    <span class="token keyword">function</span> <span class="token function">fetchResults</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
      <span class="token keyword">const</span> url <span class="token operator">=</span> <span class="token function">getFetchUrl</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
      <span class="token comment">// Do the fetching...</span>
    <span class="token punctuation">}</span>

    <span class="token keyword">function</span> <span class="token function">getFetchUrl</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
      <span class="token keyword">return</span> <span class="token punctuation">(</span>
<span class="gatsby-highlight-code-line">        <span class="token string">'http://myapi/results?query'</span> <span class="token operator">+</span> query <span class="token operator">+</span></span><span class="gatsby-highlight-code-line">        <span class="token string">'&amp;page='</span> <span class="token operator">+</span> currentPage</span>      <span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>

    <span class="token function">fetchResults</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="gatsby-highlight-code-line">  <span class="token punctuation">}</span><span class="token punctuation">,</span> <span class="token punctuation">[</span>currentPage<span class="token punctuation">,</span> query<span class="token punctuation">]</span><span class="token punctuation">)</span><span class="token punctuation">;</span> <span class="token comment">// ✅ Refetch on change</span></span>
  <span class="token comment">// ...</span>
<span class="token punctuation">}</span></code></pre></div>
<p>We put the logic <em>inside</em> of the effect, and that makes it easier to see <em>which values from the React data flow</em> it depends on. These values are called “dependencies”, and in our example they are <code class="language-text">[currentPage, query]</code>.</p>
<p>Note how this array of “effect dependencies” isn’t really a new concept. In a class, we had to search for these “dependencies” through all the method calls. The <code class="language-text">useEffect</code> API just makes the same concept explicit.</p>
<p>This, in turn, lets us validate them automatically:</p>
<p><img src="/useeffect-bc7a074c528f3b0be1b7e509b6a8683b.gif" alt="Demo of exhaustive-deps lint rule"></p>
<p><em>(This is a demo of the new recommended <code class="language-text">exhaustive-deps</code> lint rule which is a part of <code class="language-text">eslint-plugin-react-hooks</code>. It will soon be included in Create React App.)</em></p>
<p><strong>Note that it is important to respect all prop and state updates for effects regardless of whether you’re writing component as a  class or a function.</strong></p>
<p>With the class API, you have to think about consistency yourself, and verify that changes to every relevant prop or state are handled by <code class="language-text">componentDidUpdate</code>. Otherwise, your component is not resilient to prop and state changes. This is not even a React-specific problem. It applies to any UI library that lets you handle “creation” and “updates” separately.</p>
<p><strong>The <code class="language-text">useEffect</code> API flips the default by encouraging consistency.</strong> This <a href="/a-complete-guide-to-useeffect/">might feel unfamiliar at first</a>, but as a result your component becomes more resilient to changes in the logic. And since the “dependencies” are now explicit, we can <em>verify</em> the effect is consistent using a lint rule. We’re using a linter to catch bugs!</p>
<hr>
<h3 id="dont-stop-the-data-flow-in-optimizations"><a href="#dont-stop-the-data-flow-in-optimizations" aria-hidden="" class="anchor"></a>Don’t Stop the Data Flow in Optimizations</h3>
<p>There’s one more case where you might accidentally ignore changes to props. This mistake can occur when you’re manually optimizing your components.</p>
<p>Note that optimization approaches that use shallow equality like <code class="language-text">PureComponent</code> and <code class="language-text">React.memo</code> with the default comparison are safe.</p>
<p><strong>However, if you try to “optimize” a component by writing your own comparison, you may mistakenly forget to compare function props:</strong></p>
<div class="gatsby-highlight" data-language="jsx"><pre class="language-jsx"><code class="language-jsx"><span class="token keyword">class</span> <span class="token class-name">Button</span> <span class="token keyword">extends</span> <span class="token class-name">React<span class="token punctuation">.</span>Component</span> <span class="token punctuation">{</span>
<span class="gatsby-highlight-code-line">  <span class="token function">shouldComponentUpdate</span><span class="token punctuation">(</span>prevProps<span class="token punctuation">)</span> <span class="token punctuation">{</span></span><span class="gatsby-highlight-code-line">    <span class="token comment">// 🔴 Doesn't compare this.props.onClick </span></span><span class="gatsby-highlight-code-line">    <span class="token keyword">return</span> <span class="token keyword">this</span><span class="token punctuation">.</span>props<span class="token punctuation">.</span>color <span class="token operator">!==</span> prevProps<span class="token punctuation">.</span>color<span class="token punctuation">;</span></span><span class="gatsby-highlight-code-line">  <span class="token punctuation">}</span></span>  <span class="token function">render</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
<span class="gatsby-highlight-code-line">    <span class="token keyword">const</span> onClick <span class="token operator">=</span> <span class="token keyword">this</span><span class="token punctuation">.</span>props<span class="token punctuation">.</span>onClick<span class="token punctuation">;</span> <span class="token comment">// 🔴 Doesn't reflect updates</span></span>    <span class="token keyword">const</span> textColor <span class="token operator">=</span> <span class="token function">slowlyCalculateTextColor</span><span class="token punctuation">(</span><span class="token keyword">this</span><span class="token punctuation">.</span>props<span class="token punctuation">.</span>color<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token keyword">return</span> <span class="token punctuation">(</span>
      <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>button</span>
        <span class="token attr-name">onClick</span><span class="token script language-javascript"><span class="token script-punctuation punctuation">=</span><span class="token punctuation">{</span>onClick<span class="token punctuation">}</span></span>
        <span class="token attr-name">className</span><span class="token script language-javascript"><span class="token script-punctuation punctuation">=</span><span class="token punctuation">{</span><span class="token string">'Button-'</span> <span class="token operator">+</span> <span class="token keyword">this</span><span class="token punctuation">.</span>props<span class="token punctuation">.</span>color <span class="token operator">+</span> <span class="token string">' Button-text-'</span> <span class="token operator">+</span> textColor<span class="token punctuation">}</span></span><span class="token punctuation">&gt;</span></span><span class="token plain-text"></span>
<span class="token plain-text">        </span><span class="token punctuation">{</span><span class="token keyword">this</span><span class="token punctuation">.</span>props<span class="token punctuation">.</span>children<span class="token punctuation">}</span><span class="token plain-text"></span>
<span class="token plain-text">      </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>button</span><span class="token punctuation">&gt;</span></span>
    <span class="token punctuation">)</span><span class="token punctuation">;</span>
  <span class="token punctuation">}</span>
<span class="token punctuation">}</span></code></pre></div>
<p>It is easy to miss this mistake at first because with classes, you’d usually pass a <em>method</em> down, and so it would have the same identity anyway:</p>
<div class="gatsby-highlight" data-language="jsx"><pre class="language-jsx"><code class="language-jsx"><span class="token keyword">class</span> <span class="token class-name">MyForm</span> <span class="token keyword">extends</span> <span class="token class-name">React<span class="token punctuation">.</span>Component</span> <span class="token punctuation">{</span>
<span class="gatsby-highlight-code-line">  <span class="token function-variable function">handleClick</span> <span class="token operator">=</span> <span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span> <span class="token comment">// ✅ Always the same function</span></span><span class="gatsby-highlight-code-line">    <span class="token comment">// Do something</span></span><span class="gatsby-highlight-code-line">  <span class="token punctuation">}</span></span>  <span class="token function">render</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">return</span> <span class="token punctuation">(</span>
      <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span></span><span class="token punctuation">&gt;</span></span><span class="token plain-text"></span>
<span class="token plain-text">        </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>h1</span><span class="token punctuation">&gt;</span></span><span class="token plain-text">Hello!</span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>h1</span><span class="token punctuation">&gt;</span></span><span class="token plain-text"></span>
<span class="gatsby-highlight-code-line"><span class="token plain-text">        </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>Button</span> <span class="token attr-name">color</span><span class="token attr-value"><span class="token punctuation">=</span><span class="token punctuation">'</span>green<span class="token punctuation">'</span></span> <span class="token attr-name">onClick</span><span class="token script language-javascript"><span class="token script-punctuation punctuation">=</span><span class="token punctuation">{</span><span class="token keyword">this</span><span class="token punctuation">.</span>handleClick<span class="token punctuation">}</span></span><span class="token punctuation">&gt;</span></span><span class="token plain-text"></span></span><span class="gatsby-highlight-code-line"><span class="token plain-text">          Press me</span></span><span class="gatsby-highlight-code-line"><span class="token plain-text">        </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>Button</span><span class="token punctuation">&gt;</span></span><span class="token plain-text"></span></span><span class="token plain-text">      </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span></span><span class="token punctuation">&gt;</span></span>
    <span class="token punctuation">)</span>
  <span class="token punctuation">}</span>
<span class="token punctuation">}</span></code></pre></div>
<p>So our optimization doesn’t break <em>immediately</em>. However, it will keep “seeing” the old <code class="language-text">onClick</code> value if it changes over time but other props don’t:</p>
<div class="gatsby-highlight" data-language="jsx"><pre class="language-jsx"><code class="language-jsx"><span class="token keyword">class</span> <span class="token class-name">MyForm</span> <span class="token keyword">extends</span> <span class="token class-name">React<span class="token punctuation">.</span>Component</span> <span class="token punctuation">{</span>
  state <span class="token operator">=</span> <span class="token punctuation">{</span>
    isEnabled<span class="token punctuation">:</span> <span class="token boolean">true</span>
  <span class="token punctuation">}</span><span class="token punctuation">;</span>
  <span class="token function-variable function">handleClick</span> <span class="token operator">=</span> <span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span>
<span class="gatsby-highlight-code-line">    <span class="token keyword">this</span><span class="token punctuation">.</span><span class="token function">setState</span><span class="token punctuation">(</span><span class="token punctuation">{</span> isEnabled<span class="token punctuation">:</span> <span class="token boolean">false</span> <span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>    <span class="token comment">// Do something</span>
  <span class="token punctuation">}</span>
  <span class="token function">render</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">return</span> <span class="token punctuation">(</span>
      <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span></span><span class="token punctuation">&gt;</span></span><span class="token plain-text"></span>
<span class="token plain-text">        </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>h1</span><span class="token punctuation">&gt;</span></span><span class="token plain-text">Hello!</span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>h1</span><span class="token punctuation">&gt;</span></span><span class="token plain-text"></span>
<span class="gatsby-highlight-code-line"><span class="token plain-text">        </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>Button</span> <span class="token attr-name">color</span><span class="token attr-value"><span class="token punctuation">=</span><span class="token punctuation">'</span>green<span class="token punctuation">'</span></span> <span class="token attr-name">onClick</span><span class="token script language-javascript"><span class="token script-punctuation punctuation">=</span><span class="token punctuation">{</span></span><span class="gatsby-highlight-code-line">          <span class="token comment">// 🔴 Button ignores updates to the onClick prop</span></span><span class="gatsby-highlight-code-line">          <span class="token keyword">this</span><span class="token punctuation">.</span>state<span class="token punctuation">.</span>isEnabled <span class="token operator">?</span> <span class="token keyword">this</span><span class="token punctuation">.</span>handleClick <span class="token punctuation">:</span> <span class="token keyword">null</span></span>        <span class="token punctuation">}</span></span><span class="token punctuation">&gt;</span></span><span class="token plain-text"></span>
<span class="token plain-text">          Press me</span>
<span class="token plain-text">        </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>Button</span><span class="token punctuation">&gt;</span></span><span class="token plain-text"></span>
<span class="token plain-text">      </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span></span><span class="token punctuation">&gt;</span></span>
    <span class="token punctuation">)</span>
  <span class="token punctuation">}</span>
<span class="token punctuation">}</span></code></pre></div>
<p>In this example, clicking the button should disable it — but this doesn’t happen because the <code class="language-text">Button</code> component ignores any updates to the <code class="language-text">onClick</code> prop.</p>
<p>This could get even more confusing if the function identity itself depends on something that could change over time, like <code class="language-text">draft.content</code> in this example:</p>
<div class="gatsby-highlight" data-language="jsx"><pre class="language-jsx"><code class="language-jsx">  drafts<span class="token punctuation">.</span><span class="token function">map</span><span class="token punctuation">(</span>draft <span class="token operator">=&gt;</span>
    <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>Button</span>
      <span class="token attr-name">color</span><span class="token attr-value"><span class="token punctuation">=</span><span class="token punctuation">'</span>blue<span class="token punctuation">'</span></span>
      <span class="token attr-name">key</span><span class="token script language-javascript"><span class="token script-punctuation punctuation">=</span><span class="token punctuation">{</span>draft<span class="token punctuation">.</span>id<span class="token punctuation">}</span></span>
      <span class="token attr-name">onClick</span><span class="token script language-javascript"><span class="token script-punctuation punctuation">=</span><span class="token punctuation">{</span>
<span class="gatsby-highlight-code-line">        <span class="token comment">// 🔴 Button ignores updates to the onClick prop</span></span><span class="gatsby-highlight-code-line">        <span class="token keyword">this</span><span class="token punctuation">.</span>handlePublish<span class="token punctuation">.</span><span class="token function">bind</span><span class="token punctuation">(</span><span class="token keyword">this</span><span class="token punctuation">,</span> draft<span class="token punctuation">.</span>content<span class="token punctuation">)</span></span>      <span class="token punctuation">}</span></span><span class="token punctuation">&gt;</span></span><span class="token plain-text"></span>
<span class="token plain-text">      Publish</span>
<span class="token plain-text">    </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>Button</span><span class="token punctuation">&gt;</span></span>
  <span class="token punctuation">)</span></code></pre></div>
<p>While <code class="language-text">draft.content</code> could change over time, our <code class="language-text">Button</code> component ignored change to the <code class="language-text">onClick</code> prop so it continues to see the “first version” of the <code class="language-text">onClick</code> bound method with the original <code class="language-text">draft.content</code>.</p>
<p><strong>So how do we avoid this problem?</strong></p>
<p>I recommend to avoid manually implementing <code class="language-text">shouldComponentUpdate</code> and to avoid specifying a custom comparison to <code class="language-text">React.memo()</code>. The default shallow comparison in <code class="language-text">React.memo</code> will respect changing function identity:</p>
<div class="gatsby-highlight" data-language="jsx"><pre class="language-jsx"><code class="language-jsx"><span class="token keyword">function</span> <span class="token function">Button</span><span class="token punctuation">(</span><span class="token punctuation">{</span> onClick<span class="token punctuation">,</span> color<span class="token punctuation">,</span> children <span class="token punctuation">}</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
  <span class="token keyword">const</span> textColor <span class="token operator">=</span> <span class="token function">slowlyCalculateTextColor</span><span class="token punctuation">(</span><span class="token keyword">this</span><span class="token punctuation">.</span>props<span class="token punctuation">.</span>color<span class="token punctuation">)</span><span class="token punctuation">;</span>
  <span class="token keyword">return</span> <span class="token punctuation">(</span>
    <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>button</span>
      <span class="token attr-name">onClick</span><span class="token script language-javascript"><span class="token script-punctuation punctuation">=</span><span class="token punctuation">{</span>onClick<span class="token punctuation">}</span></span>
      <span class="token attr-name">className</span><span class="token script language-javascript"><span class="token script-punctuation punctuation">=</span><span class="token punctuation">{</span><span class="token string">'Button-'</span> <span class="token operator">+</span> color <span class="token operator">+</span> <span class="token string">' Button-text-'</span> <span class="token operator">+</span> textColor<span class="token punctuation">}</span></span><span class="token punctuation">&gt;</span></span><span class="token plain-text"></span>
<span class="token plain-text">      </span><span class="token punctuation">{</span>children<span class="token punctuation">}</span><span class="token plain-text"></span>
<span class="token plain-text">    </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>button</span><span class="token punctuation">&gt;</span></span>
  <span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
<span class="gatsby-highlight-code-line"><span class="token keyword">export</span> <span class="token keyword">default</span> React<span class="token punctuation">.</span><span class="token function">memo</span><span class="token punctuation">(</span>Button<span class="token punctuation">)</span><span class="token punctuation">;</span> <span class="token comment">// ✅ Uses shallow comparison</span></span></code></pre></div>
<p>In a class, <code class="language-text">PureComponent</code> has the same behavior.</p>
<p>This ensures that passing a different function as a prop will always work.</p>
<p>If you insist on a custom comparison, <strong>make sure that you don’t skip functions:</strong></p>
<div class="gatsby-highlight" data-language="jsx"><pre class="language-jsx"><code class="language-jsx">  <span class="token function">shouldComponentUpdate</span><span class="token punctuation">(</span>prevProps<span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token comment">// ✅ Compares this.props.onClick </span>
    <span class="token keyword">return</span> <span class="token punctuation">(</span>
      <span class="token keyword">this</span><span class="token punctuation">.</span>props<span class="token punctuation">.</span>color <span class="token operator">!==</span> prevProps<span class="token punctuation">.</span>color <span class="token operator">||</span>
<span class="gatsby-highlight-code-line">      <span class="token keyword">this</span><span class="token punctuation">.</span>props<span class="token punctuation">.</span>onClick <span class="token operator">!==</span> prevProps<span class="token punctuation">.</span>onClick</span>    <span class="token punctuation">)</span><span class="token punctuation">;</span>
  <span class="token punctuation">}</span></code></pre></div>
<p>As I mentioned earlier, it’s easy to miss this problem in a class component because method identities are often stable (but not always — and that’s where the bugs become difficult to debug). With Hooks, the situation is a bit different:</p>
<ol>
<li>Functions are different <em>on every render</em> so you discover this problem <a href="https://github.com/facebook/react/issues/14972#issuecomment-468280039" target="_blank" rel="nofollow noopener noreferrer">right away</a>.</li>
<li>With <code class="language-text">useCallback</code> and <code class="language-text">useContext</code>, you can <a href="https://reactjs.org/docs/hooks-faq.html#how-to-avoid-passing-callbacks-down" target="_blank" rel="nofollow noopener noreferrer">avoid passing functions deep down altogether</a>. This lets you optimize rendering without worrying about functions.</li>
</ol>
<hr>
<p>To sum up this section, <strong>don’t stop the data flow!</strong></p>
<p>Whenever you use props and state, consider what should happen if they change. In most cases, a component shouldn’t treat the initial render and updates differently. That makes it resilient to changes in the logic.</p>
<p>With classes, it’s easy to forget about updates when using props and state inside the lifecycle methods. Hooks nudge you to do the right thing — but it takes some mental adjustment if you’re not used to already doing it.</p>
<hr>
<h2 id="principle-2-always-be-ready-to-render"><a href="#principle-2-always-be-ready-to-render" aria-hidden="" class="anchor"></a>Principle 2: Always Be Ready to Render</h2>
<p>React components let you write rendering code without worrying too much about time. You describe how the UI <em>should</em> look at any given moment, and React makes it happen. Take advantage of that model!</p>
<p>Don’t try to introduce unnecessary timing assumptions into your component behavior. <strong>Your component should be ready to re-render at any time.</strong></p>
<p>How can one violate this principle? React doesn’t make it very easy — but you can do it by using the legacy <code class="language-text">componentWillReceiveProps</code> lifecycle method:</p>
<div class="gatsby-highlight" data-language="jsx"><pre class="language-jsx"><code class="language-jsx"><span class="token keyword">class</span> <span class="token class-name">TextInput</span> <span class="token keyword">extends</span> <span class="token class-name">React<span class="token punctuation">.</span>Component</span> <span class="token punctuation">{</span>
  state <span class="token operator">=</span> <span class="token punctuation">{</span>
    value<span class="token punctuation">:</span> <span class="token string">''</span>
  <span class="token punctuation">}</span><span class="token punctuation">;</span>
<span class="gatsby-highlight-code-line">  <span class="token comment">// 🔴 Resets local state on every parent render</span></span><span class="gatsby-highlight-code-line">  <span class="token function">componentWillReceiveProps</span><span class="token punctuation">(</span>nextProps<span class="token punctuation">)</span> <span class="token punctuation">{</span></span><span class="gatsby-highlight-code-line">    <span class="token keyword">this</span><span class="token punctuation">.</span><span class="token function">setState</span><span class="token punctuation">(</span><span class="token punctuation">{</span> value<span class="token punctuation">:</span> nextProps<span class="token punctuation">.</span>value <span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span><span class="gatsby-highlight-code-line">  <span class="token punctuation">}</span></span>  <span class="token function-variable function">handleChange</span> <span class="token operator">=</span> <span class="token punctuation">(</span>e<span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span>
    <span class="token keyword">this</span><span class="token punctuation">.</span><span class="token function">setState</span><span class="token punctuation">(</span><span class="token punctuation">{</span> value<span class="token punctuation">:</span> e<span class="token punctuation">.</span>target<span class="token punctuation">.</span>value <span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
  <span class="token punctuation">}</span><span class="token punctuation">;</span>
  <span class="token function">render</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">return</span> <span class="token punctuation">(</span>
      <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>input</span>
        <span class="token attr-name">value</span><span class="token script language-javascript"><span class="token script-punctuation punctuation">=</span><span class="token punctuation">{</span><span class="token keyword">this</span><span class="token punctuation">.</span>state<span class="token punctuation">.</span>value<span class="token punctuation">}</span></span>
        <span class="token attr-name">onChange</span><span class="token script language-javascript"><span class="token script-punctuation punctuation">=</span><span class="token punctuation">{</span><span class="token keyword">this</span><span class="token punctuation">.</span>handleChange<span class="token punctuation">}</span></span>
      <span class="token punctuation">/&gt;</span></span>
    <span class="token punctuation">)</span><span class="token punctuation">;</span>
  <span class="token punctuation">}</span>
<span class="token punctuation">}</span></code></pre></div>
<p>In this example, we keep <code class="language-text">value</code> in the local state, but we <em>also</em> receive <code class="language-text">value</code> from props. Whenever we “receive new props”, we reset the <code class="language-text">value</code> in state.</p>
<p><strong>The problem with this pattern is that it entirely relies on accidental timing.</strong></p>
<p>Maybe today this component’s parent updates rarely, and so our <code class="language-text">TextInput</code> only “receives props” when something important happens, like saving a form.</p>
<p>But tomorrow you might add some animation to the parent of <code class="language-text">TextInput</code>. If its parent re-renders more often, it will keep <a href="https://codesandbox.io/s/m3w9zn1z8x" target="_blank" rel="nofollow noopener noreferrer">“blowing away”</a> the child state! You can read more about this problem in <a href="https://reactjs.org/blog/2018/06/07/you-probably-dont-need-derived-state.html" target="_blank" rel="nofollow noopener noreferrer">“You Probably Don’t Need Derived State”</a>.</p>
<p><strong>So how can we fix this?</strong></p>
<p>First of all, we need to fix our mental model. We need to stop thinking of “receiving props” as something different from just “rendering”. A re-render caused by a parent shouldn’t behave differently from a re-render caused by our own local state change. <strong>Components should be resilient to rendering less or more often because otherwise they’re too coupled to their particular parents.</strong></p>
<p><em>(<a href="https://codesandbox.io/s/m3w9zn1z8x" target="_blank" rel="nofollow noopener noreferrer">This demo</a> shows how re-rendering can break fragile components.)</em></p>
<p>While there are a few <a href="https://reactjs.org/blog/2018/06/07/you-probably-dont-need-derived-state.html#preferred-solutions" target="_blank" rel="nofollow noopener noreferrer">different</a> <a href="https://reactjs.org/docs/hooks-faq.html#how-do-i-implement-getderivedstatefromprops" target="_blank" rel="nofollow noopener noreferrer">solutions</a> for when you <em>truly</em> want to derive state from props, usually you should use either a fully controlled component:</p>
<div class="gatsby-highlight" data-language="jsx"><pre class="language-jsx"><code class="language-jsx"><span class="token comment">// Option 1: Fully controlled component.</span>
<span class="token keyword">function</span> <span class="token function">TextInput</span><span class="token punctuation">(</span><span class="token punctuation">{</span> value<span class="token punctuation">,</span> onChange <span class="token punctuation">}</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
  <span class="token keyword">return</span> <span class="token punctuation">(</span>
    <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>input</span>
      <span class="token attr-name">value</span><span class="token script language-javascript"><span class="token script-punctuation punctuation">=</span><span class="token punctuation">{</span>value<span class="token punctuation">}</span></span>
      <span class="token attr-name">onChange</span><span class="token script language-javascript"><span class="token script-punctuation punctuation">=</span><span class="token punctuation">{</span>onChange<span class="token punctuation">}</span></span>
    <span class="token punctuation">/&gt;</span></span>
  <span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span></code></pre></div>
<p>Or you can use an uncontrolled component with a key to reset it:</p>
<div class="gatsby-highlight" data-language="jsx"><pre class="language-jsx"><code class="language-jsx"><span class="token comment">// Option 2: Fully uncontrolled component.</span>
<span class="token keyword">function</span> <span class="token function">TextInput</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
  <span class="token keyword">const</span> <span class="token punctuation">[</span>value<span class="token punctuation">,</span> setValue<span class="token punctuation">]</span> <span class="token operator">=</span> <span class="token function">useState</span><span class="token punctuation">(</span><span class="token string">''</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
  <span class="token keyword">return</span> <span class="token punctuation">(</span>
    <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>input</span>
      <span class="token attr-name">value</span><span class="token script language-javascript"><span class="token script-punctuation punctuation">=</span><span class="token punctuation">{</span>value<span class="token punctuation">}</span></span>
      <span class="token attr-name">onChange</span><span class="token script language-javascript"><span class="token script-punctuation punctuation">=</span><span class="token punctuation">{</span>e <span class="token operator">=&gt;</span> <span class="token function">setValue</span><span class="token punctuation">(</span>e<span class="token punctuation">.</span>target<span class="token punctuation">.</span>value<span class="token punctuation">)</span><span class="token punctuation">}</span></span>
    <span class="token punctuation">/&gt;</span></span>
  <span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>

<span class="token comment">// We can reset its internal state later by changing the key:</span>
<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>TextInput</span> <span class="token attr-name">key</span><span class="token script language-javascript"><span class="token script-punctuation punctuation">=</span><span class="token punctuation">{</span>formId<span class="token punctuation">}</span></span> <span class="token punctuation">/&gt;</span></span></code></pre></div>
<p>The takeaway from this section is that your component shouldn’t break just because it or its parent re-renders more often. The React API design makes it easy if you avoid the legacy <code class="language-text">componentWillReceiveProps</code> lifecycle method.</p>
<p>To stress-test your component, you can temporarily add this code to its parent:</p>
<div class="gatsby-highlight" data-language="js"><pre class="language-js"><code class="language-js"><span class="token function">componentDidMount</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
<span class="gatsby-highlight-code-line">  <span class="token comment">// Don't forget to remove this immediately!</span></span>  <span class="token function">setInterval</span><span class="token punctuation">(</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token keyword">this</span><span class="token punctuation">.</span><span class="token function">forceUpdate</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">,</span> <span class="token number">100</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span></code></pre></div>
<p><strong>Don’t leave this code in</strong> — it’s just a quick way to check what happens when a parent re-renders more often than you expected. It shouldn’t break the child!</p>
<hr>
<p>You might be thinking: “I’ll keep resetting state when the props change, but will prevent unnecessary re-renders with <code class="language-text">PureComponent</code>”.</p>
<p>This code should work, right?</p>
<div class="gatsby-highlight" data-language="jsx"><pre class="language-jsx"><code class="language-jsx"><span class="gatsby-highlight-code-line"><span class="token comment">// 🤔 Should prevent unnecessary re-renders... right?</span></span><span class="gatsby-highlight-code-line"><span class="token keyword">class</span> <span class="token class-name">TextInput</span> <span class="token keyword">extends</span> <span class="token class-name">React<span class="token punctuation">.</span>PureComponent</span> <span class="token punctuation">{</span></span>  state <span class="token operator">=</span> <span class="token punctuation">{</span>
    value<span class="token punctuation">:</span> <span class="token string">''</span>
  <span class="token punctuation">}</span><span class="token punctuation">;</span>
  <span class="token comment">// 🔴 Resets local state on every parent render</span>
  <span class="token function">componentWillReceiveProps</span><span class="token punctuation">(</span>nextProps<span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">this</span><span class="token punctuation">.</span><span class="token function">setState</span><span class="token punctuation">(</span><span class="token punctuation">{</span> value<span class="token punctuation">:</span> nextProps<span class="token punctuation">.</span>value <span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
  <span class="token punctuation">}</span>
  <span class="token function-variable function">handleChange</span> <span class="token operator">=</span> <span class="token punctuation">(</span>e<span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span>
    <span class="token keyword">this</span><span class="token punctuation">.</span><span class="token function">setState</span><span class="token punctuation">(</span><span class="token punctuation">{</span> value<span class="token punctuation">:</span> e<span class="token punctuation">.</span>target<span class="token punctuation">.</span>value <span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
  <span class="token punctuation">}</span><span class="token punctuation">;</span>
  <span class="token function">render</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">return</span> <span class="token punctuation">(</span>
      <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>input</span>
        <span class="token attr-name">value</span><span class="token script language-javascript"><span class="token script-punctuation punctuation">=</span><span class="token punctuation">{</span><span class="token keyword">this</span><span class="token punctuation">.</span>state<span class="token punctuation">.</span>value<span class="token punctuation">}</span></span>
        <span class="token attr-name">onChange</span><span class="token script language-javascript"><span class="token script-punctuation punctuation">=</span><span class="token punctuation">{</span><span class="token keyword">this</span><span class="token punctuation">.</span>handleChange<span class="token punctuation">}</span></span>
      <span class="token punctuation">/&gt;</span></span>
    <span class="token punctuation">)</span><span class="token punctuation">;</span>
  <span class="token punctuation">}</span>
<span class="token punctuation">}</span></code></pre></div>
<p>At first, it might seem like this component solves the problem of&nbsp;“blowing away” the state on parent re-render. After all, if the props are the same, we just skip the update — and so <code class="language-text">componentWillReceiveProps</code> doesn’t get called.</p>
<p>However, this gives us a false sense of security. <strong>This component is still not resilient to <em>actual</em> prop changes.</strong> For example, if we added <em>another</em> often-changing prop, like an animated <code class="language-text">style</code>, we would still “lose” the internal state:</p>
<div class="gatsby-highlight" data-language="jsx"><pre class="language-jsx"><code class="language-jsx"><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>TextInput</span>
<span class="gatsby-highlight-code-line">  <span class="token attr-name">style</span><span class="token script language-javascript"><span class="token script-punctuation punctuation">=</span><span class="token punctuation">{</span><span class="token punctuation">{</span>opacity<span class="token punctuation">:</span> someValueFromState<span class="token punctuation">}</span><span class="token punctuation">}</span></span></span>  <span class="token attr-name">value</span><span class="token script language-javascript"><span class="token script-punctuation punctuation">=</span><span class="token punctuation">{</span>
    <span class="token comment">// 🔴 componentWillReceiveProps in TextInput</span>
    <span class="token comment">// resets to this value on every animation tick.</span>
    value
  <span class="token punctuation">}</span></span>
<span class="token punctuation">/&gt;</span></span></code></pre></div>
<p>So this approach is still flawed. We can see that various optimizations like <code class="language-text">PureComponent</code>, <code class="language-text">shouldComponentUpdate</code>, and <code class="language-text">React.memo</code> shouldn’t be used for controlling <em>behavior</em>. Only use them to improve <em>performance</em> where it helps. If removing an optimization <em>breaks</em> a component, it was too fragile to begin with.</p>
<p>The solution here is the same as we described earlier. Don’t treat “receiving props” as a special event. Avoid “syncing” props and state. In most cases, every value should either be fully controlled (through props), or fully uncontrolled (in local state). Avoid derived state <a href="https://reactjs.org/blog/2018/06/07/you-probably-dont-need-derived-state.html#preferred-solutions" target="_blank" rel="nofollow noopener noreferrer">when you can</a>. <strong>And always be ready to render!</strong></p>
<hr>
<h2 id="principle-3-no-component-is-a-singleton"><a href="#principle-3-no-component-is-a-singleton" aria-hidden="" class="anchor"></a>Principle 3: No Component Is a Singleton</h2>
<p>Sometimes we assume a certain component is only ever displayed once. Such as a navigation bar. This might be true for some time. However, this assumption often causes design problems that only surface much later. </p>
<p>For example, maybe you need to implement an animation <em>between</em> two <code class="language-text">Page</code> components on a route change — the previous <code class="language-text">Page</code> and the next <code class="language-text">Page</code>. Both of them need to be mounted during the animation. However, you might discover that each of those components assumes it’s the only <code class="language-text">Page</code> on the screen.</p>
<p>It’s easy to check for these problems. Just for fun, try to render your app twice:</p>
<div class="gatsby-highlight" data-language="jsx"><pre class="language-jsx"><code class="language-jsx">ReactDOM<span class="token punctuation">.</span><span class="token function">render</span><span class="token punctuation">(</span>
  <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span></span><span class="token punctuation">&gt;</span></span><span class="token plain-text"></span>
<span class="gatsby-highlight-code-line"><span class="token plain-text">    </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>MyApp</span> <span class="token punctuation">/&gt;</span></span><span class="token plain-text"></span></span><span class="gatsby-highlight-code-line"><span class="token plain-text">    </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>MyApp</span> <span class="token punctuation">/&gt;</span></span><span class="token plain-text"></span></span><span class="token plain-text">  </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span></span><span class="token punctuation">&gt;</span></span><span class="token punctuation">,</span>
  document<span class="token punctuation">.</span><span class="token function">getElementById</span><span class="token punctuation">(</span><span class="token string">'root'</span><span class="token punctuation">)</span>
<span class="token punctuation">)</span><span class="token punctuation">;</span></code></pre></div>
<p>Click around. (You might need to tweak some CSS for this experiment.)</p>
<p><strong>Does your app still behave as expected?</strong> Or do you see strange crashes and errors? It’s a good idea to do this stress test on complex components once in a while, and ensure that multiple copies of them don’t conflict with one another.</p>
<p>An example of a problematic pattern I’ve written myself a few times is performing global state “cleanup” in <code class="language-text">componentWillUnmount</code>:</p>
<div class="gatsby-highlight" data-language="jsx"><pre class="language-jsx"><code class="language-jsx"><span class="token function">componentWillUnmount</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
<span class="gatsby-highlight-code-line">  <span class="token comment">// Resets something in Redux store</span></span><span class="gatsby-highlight-code-line">  <span class="token keyword">this</span><span class="token punctuation">.</span>props<span class="token punctuation">.</span><span class="token function">resetForm</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span><span class="token punctuation">}</span></code></pre></div>
<p>Of course, if there are two such components on the page, unmounting one of them can break the other one. Resetting “global” state on <em>mount</em> is no better:</p>
<div class="gatsby-highlight" data-language="jsx"><pre class="language-jsx"><code class="language-jsx"><span class="token function">componentDidMount</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
<span class="gatsby-highlight-code-line">  <span class="token comment">// Resets something in Redux store</span></span><span class="gatsby-highlight-code-line">  <span class="token keyword">this</span><span class="token punctuation">.</span>props<span class="token punctuation">.</span><span class="token function">resetForm</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span><span class="token punctuation">}</span></code></pre></div>
<p>In that case <em>mounting</em> a second form will break the first one.</p>
<p>These patterns are good indicators of where our components are fragile. <strong><em>Showing</em> or <em>hiding</em> a tree shouldn’t break components outside of that tree.</strong></p>
<p>Whether you plan to render this component twice or not, solving these issues pays off in the longer term. It leads you to a more resilient design.</p>
<hr>
<h2 id="principle-4-keep-the-local-state-isolated"><a href="#principle-4-keep-the-local-state-isolated" aria-hidden="" class="anchor"></a>Principle 4: Keep the Local State Isolated</h2>
<p>Consider a social media <code class="language-text">Post</code> component. It has a list of <code class="language-text">Comment</code> threads (that can be expanded) and a <code class="language-text">NewComment</code> input.</p>
<p>React components may have local state. But what state is truly local? Is the post content itself local state or not? What about the list of comments? Or the record of which comment threads are expanded? Or the value of the comment input?</p>
<p>If you’re used to putting everything into a “state manager”, answering this question can be challenging. So here’s a simple way to decide.</p>
<p><strong>If you’re not sure whether some state is local, ask yourself: “If this component was rendered twice, should this interaction reflect in the other copy?” Whenever the answer is “no”, you found some local state.</strong></p>
<p>For example, imagine we rendered the same <code class="language-text">Post</code> twice. Let’s look at different things inside of it that can change.</p>
<ul>
<li>
<p><em>Post content.</em> We’d want editing the post in one tree to update it in another tree. Therefore, it probably <strong>should not</strong> be the local state of a <code class="language-text">Post</code> component. (Instead, the post content could live in some cache like Apollo, Relay, or Redux.)</p>
</li>
<li>
<p><em>List of comments.</em> This is similar to post content. We’d want adding a new comment in one tree to be reflected in the other tree too. So ideally we would use some kind of a cache for it, and it <strong>should not</strong> be a local state of our <code class="language-text">Post</code>.</p>
</li>
<li>
<p><em>Which comments are expanded.</em> It would be weird if expanding a comment in one tree would also expand it in another tree. In this case we’re interacting with a particular <code class="language-text">Comment</code> <em>UI representation</em> rather than an abstract “comment entity”. Therefore, an “expanded” flag <strong>should</strong> be a local state of the <code class="language-text">Comment</code>.</p>
</li>
<li>
<p><em>The value of new comment input.</em> It would be odd if typing a comment in one input would also update an input in another tree. Unless inputs are clearly grouped together, usually people expect them to be independent. So the input value <strong>should</strong> be a local state of the <code class="language-text">NewComment</code> component.</p>
</li>
</ul>
<p>I don’t suggest a dogmatic interpretation of these rules. Of course, in a simpler app you might want to use local state for everything, including those “caches”. I’m only talking about the ideal user experience <a href="/the-elements-of-ui-engineering/">from the first principles</a>.</p>
<p><strong>Avoid making truly local state global.</strong> This plays into our topic of “resilience”: there’s fewer surprising synchronization happening between components. As a bonus, this <em>also</em> fixes a large class of performance issues. “Over-rendering” is much less of an issue when your state is in the right place.</p>
<hr>
<h2 id="recap"><a href="#recap" aria-hidden="" class="anchor"></a>Recap</h2>
<p>Let’s recap these principles one more time:</p>
<ol>
<li><strong><a href="#principle-1-dont-stop-the-data-flow">Don’t stop the data flow.</a></strong> Props and state can change, and components should handle those changes whenever they happen.</li>
<li><strong><a href="#principle-2-always-be-ready-to-render">Always be ready to render.</a></strong> A component shouldn’t break because it’s rendered more or less often.</li>
<li><strong><a href="#principle-3-no-component-is-a-singleton">No component is a singleton.</a></strong> Even if a component is rendered just once, your design will improve if rendering twice doesn’t break it.</li>
<li><strong><a href="#principle-4-keep-the-local-state-isolated">Keep the local state isolated.</a></strong> Think about which state is local to a particular UI representation — and don’t hoist that state higher than necessary.</li>
</ol>
<p><strong>These principles help you write components that are <a href="/optimized-for-change/">optimized for change</a>. It’s easy to add, change them, and delete them.</strong></p>
<p>And most importantly, once our components are resilient, we can come back to the pressing dilemma of whether or not props should be sorted by alphabet.</p>