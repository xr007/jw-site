import React from 'react'
import Helmet from 'react-helmet'
import { Link,graphql } from 'gatsby'
import get from 'lodash/get'

import Layout from '../components/layout'
import Button from '../components/Button/button.js'

class WorkPostTemplate extends React.Component {
  theme(bg,bgf,p,pf,s,sf,wb,wt,fbg) {
    document.documentElement.style.setProperty('--bg', bg);
    document.documentElement.style.setProperty('--bg-faded', bgf);
    document.documentElement.style.setProperty('--primary', p);
    document.documentElement.style.setProperty('--primary-faded', pf);
    document.documentElement.style.setProperty('--secondary', s);
    document.documentElement.style.setProperty('--secondary-faded', sf);
    document.documentElement.style.setProperty('--window-border', wb);
    document.documentElement.style.setProperty('--window-title', wt);
    document.documentElement.style.setProperty('--footer-bg', fbg);
    let metaThemeColor = document.querySelector("meta[name=theme-color]");
    metaThemeColor.setAttribute("content", getComputedStyle(document.documentElement).getPropertyValue('--bg'));
  }
  componentDidMount() {
    const post = this.props.data.markdownRemark
    console.log(post.frontmatter);
    if (post.frontmatter.theme) {
      this.theme(post.frontmatter.tbg,post.frontmatter.tbgf,post.frontmatter.tp,post.frontmatter.tpf,post.frontmatter.ts,post.frontmatter.tsf,post.frontmatter.twb,post.frontmatter.twt,post.frontmatter.tfbg);
    }
    
    window.addEventListener('scroll', this.throttle(this.removeTitle,50));
  }
  componentWillUnmount() {
    window.removeEventListener('scroll', this.throttle(this.removeTitle,50));
  }
  throttle(fn, wait) {
    var time = Date.now();
    return function() {
      if ((time + wait - Date.now()) < 0) {
        fn();
        time = Date.now();
      }
    }
  }
  removeTitle() {
    let title = document.querySelector(".work-post-title"),
        titleHeight = title.offsetHeight,
        scrollBottom = window.pageYOffset + titleHeight,
        footerOffset = document.querySelector(".wrapper").offsetHeight,
        newTopValue = footerOffset - titleHeight+"px";
    if (scrollBottom >= footerOffset) {
      title.style.position = "absolute";
      title.style.top = newTopValue;
    } else {
      title.style.position = "fixed";
      title.style.top = "0";
    }
    // console.log(scrollBottom, footerOffset);
  }
  render() {
    const post = this.props.data.markdownRemark
    const siteTitle = get(this.props, 'data.site.siteMetadata.title')
    const siteDescription = post.excerpt
    const { previous, next } = this.props.pageContext
    const siteURL = post.frontmatter.url
    let coverVideo;
    if (post.frontmatter.featuredVideo != null) {
     coverVideo = <video src={post.frontmatter.featuredVideo.publicURL} autoPlay muted loop playsInline className="vid-wrap" />;
    } else {
     coverVideo = "";
    }

    return (
      <Layout location={this.props.location}>
        <Helmet
          meta={[{ name: 'description', content: siteDescription }]}
          title={`${post.frontmatter.title} Website - ${siteTitle}`}
        />
        {coverVideo}
       <div className="work-post-title centered-title preload">
         <h1>{post.frontmatter.title}</h1>
       </div>

      <div className="work-post-scrollDown">👇</div>
       
       <div className="work-post-container container Rte">
         <div className="work-post-description">
          <div className="desc-info">
             <p>Company: {post.frontmatter.title}<br />
             Date: {post.frontmatter.date}<br />
             Team: {post.frontmatter.team}</p>
           </div>
           
           <div className="desc-content" dangerouslySetInnerHTML={{ __html: post.html }} />
          </div>

         <div className="demoVideo" style={{marginTop: '20vh'}}>
          <img src="https://placehold.it/1920x1080" />
         </div>
         <div className="work-post-footer">
           <div className="website-btn">
             <Button external="true" href={`https://www.${post.frontmatter.url}`} inlineicon="right">{post.frontmatter.url} <span>&#8599;</span></Button>
           </div>
           <div className="work-post-nav">
               {
                   previous &&
                   <Button className="prev-btn" size="tiny" inlineicon="left" to={previous.fields.slug} rel="prev">
                     Prev: {previous.frontmatter.title} <span>&larr;</span> 
                   </Button>
                 }
                 {
                   next &&
                   <Button className="next-btn" size="tiny" inlineicon="right" to={next.fields.slug} rel="next">
                     Next: {next.frontmatter.title} <span>&rarr;</span>
                   </Button>
                 }
           </div>
         </div>
       </div>

      </Layout>
    )
  }
}

export default WorkPostTemplate

export const pageQuery = graphql`
  query WorkPostBySlug($slug: String!) {
    site {
      siteMetadata {
        title
        author
      }
    }
    markdownRemark(fields: { slug: { eq: $slug } }) {
      id
      excerpt
      html
      frontmatter {
        title
        date(formatString: "MMMM DD, YYYY")
        team
        url
        featuredVideo {
          publicURL
        }
        theme
        tbg
        tbgf
        tp
        tpf
        ts
        tsf
        twb
        twt
        tfbg
      }
    }
  }
`
