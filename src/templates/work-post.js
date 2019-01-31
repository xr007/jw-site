import React from 'react'
import Helmet from 'react-helmet'
import { Link,graphql } from 'gatsby'
import get from 'lodash/get'

import Layout from '../components/layout'
import Button from '../components/Button/button.js'
import Window from '../components/Window/window.js'

import MediaQuery from 'react-responsive'

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
    // window.addEventListener('scroll', this.throttle());
  }
  componentWillUnmount() {
    // window.removeEventListener('scroll', this.throttle());
  }
  // throttle(fn, wait) {
  //   var time = Date.now();
  //   return function() {
  //     if ((time + wait - Date.now()) < 0) {
  //       fn();
  //       time = Date.now();
  //     }
  //   }
  // }
  render() {
    const post = this.props.data.markdownRemark
    const siteTitle = get(this.props, 'data.site.siteMetadata.title')
    const siteDescription = post.excerpt
    const { previous, next } = this.props.pageContext
    const siteURL = post.frontmatter.url
    let coverVideo, reelVideo;
    if (post.frontmatter.featuredVideo != null) {
     coverVideo = <video src={post.frontmatter.featuredVideo.publicURL} autoPlay muted loop playsInline />;
     reelVideo = <video src={post.frontmatter.featuredVideo.publicURL} autoPlay muted loop playsInline controls />;
    } else {
     coverVideo = "";
    }

    return (
      <Layout location={this.props.location}>
        <Helmet
          meta={[{ name: 'description', content: siteDescription }]}
          title={`${post.frontmatter.title} Website - ${siteTitle}`}
        />

        <div className="vid-wrap" style={{opacity: 0.4}}>{coverVideo}</div>

        <div className="work-post-title centered-title preload container">
          <h1 className="title">{post.frontmatter.title}</h1>
          <div className="website-btn">
            <Button external="true" href={`https://www.${post.frontmatter.url}`} inlineicon="right">{post.frontmatter.url} <span>&#8599;</span></Button>
          </div>
        </div>

        <div className="work-post-scrollDown">👇🏻</div>

        <div className="work-post-container Rte">
          <div className="work-post-content">
            <div className="work-post-description-wrap container">
              <div className="work-post-description">
                <div className="desc-info">
                  <p>PROJECT<br />E-Commerce Launch and Homepage Refresh</p>
                  <p>DATE LAUNCHED<br />{post.frontmatter.date}</p>
                  <p>AGENCY<br />{post.frontmatter.team}</p>
                  <p>ROLE<br />Web Developer</p>
                </div>
                <h2 className="h3">Key Points:</h2>
                <div className="desc-content" dangerouslySetInnerHTML={{ __html: post.html }}>
                </div>
              </div>

              <MediaQuery query="(min-width: 1px)" key={'w1'}>
                  <MediaQuery query="(min-width: 1440px)">
                    <Window 
                      title="Error"
                      width={360}
                      height={202.5}
                      minWidth={280}
                      lockAspect={1.77777778}
                      lockAspectRatioExtraHeight={26}
                      className="work-window"
                      yOffset={100}
                      xOffset={740}
                      >
                       <p>This program requires Windows 95.</p>
                       <Button size="small" to="/work/">OK</Button>
                    </Window>
                  </MediaQuery>
                  <MediaQuery query="(min-width: 741px) and (max-width: 1339px)">
                    <Window 
                      title="Error"
                      width={360}
                      height={202.5}
                      minWidth={280}
                      lockAspect={1.77777778}
                      lockAspectRatioExtraHeight={26}
                      className="work-window"
                      yOffset={100}
                      xOffset={100}
                      >
                       <p>This program requires Windows 95.</p>
                       <Button size="small" to="/work/">OK</Button>
                    </Window>
                  </MediaQuery>
                  <MediaQuery query="(max-width: 740px)">
                    <Window 
                      title="Error"
                      width={360}
                      height={202.5}
                      minWidth={280}
                      lockAspect={1.77777778}
                      lockAspectRatioExtraHeight={26}
                      className="work-window"
                      yOffset={100}
                      xOffset={0}
                      >
                       <p>This program requires Windows 95.</p>
                       <Button size="small" to="/work/">OK</Button>
                    </Window>
                  </MediaQuery>
              </MediaQuery>


              <MediaQuery query="(min-width: 1px)" key={'w2'}>
                  <MediaQuery query="(min-width: 1440px)">
                    <Window 
                      title="Error"
                      width={360}
                      height={202.5}
                      minWidth={280}
                      lockAspect={1.77777778}
                      lockAspectRatioExtraHeight={26}
                      className="work-window"
                      yOffset={200}
                      xOffset={740}
                      >
                       <p>This program requires Windows 95.</p>
                       <Button size="small" to="/work/">OK</Button>
                    </Window>
                  </MediaQuery>
                  <MediaQuery query="(min-width: 741px) and (max-width: 1339px)">
                    <Window 
                      title="Error"
                      width={360}
                      height={202.5}
                      minWidth={280}
                      lockAspect={1.77777778}
                      lockAspectRatioExtraHeight={26}
                      className="work-window"
                      yOffset={600}
                      xOffset={100}
                      >
                       <p>This program requires Windows 95.</p>
                       <Button size="small" to="/work/">OK</Button>
                    </Window>
                  </MediaQuery>
                  <MediaQuery query="(max-width: 740px)">
                    <Window 
                      title="Error"
                      width={360}
                      height={202.5}
                      minWidth={280}
                      lockAspect={1.77777778}
                      lockAspectRatioExtraHeight={26}
                      className="work-window"
                      yOffset={200}
                      xOffset={0}
                      >
                       <p>This program requires Windows 95.</p>
                       <Button size="small" to="/work/">OK</Button>
                    </Window>
                  </MediaQuery>
              </MediaQuery>



              <MediaQuery query="(min-width: 1px)" key={'w3'}>
                  <MediaQuery query="(min-width: 1440px)">
                    <Window 
                      title="Error"
                      width={360}
                      height={202.5}
                      minWidth={280}
                      lockAspect={1.77777778}
                      lockAspectRatioExtraHeight={26}
                      className="work-window"
                      yOffset={300}
                      xOffset={740}
                      >
                       <p>This program requires Windows 95.</p>
                       <Button size="small" to="/work/">OK</Button>
                    </Window>
                  </MediaQuery>
                  <MediaQuery query="(min-width: 741px) and (max-width: 1339px)">
                    <Window 
                      title="Error"
                      width={360}
                      height={202.5}
                      minWidth={280}
                      lockAspect={1.77777778}
                      lockAspectRatioExtraHeight={26}
                      className="work-window"
                      yOffset={700}
                      xOffset={100}
                      >
                       <p>This program requires Windows 95.</p>
                       <Button size="small" to="/work/">OK</Button>
                    </Window>
                  </MediaQuery>
                  <MediaQuery query="(max-width: 740px)">
                    <Window 
                      title="Error"
                      width={360}
                      height={202.5}
                      minWidth={280}
                      lockAspect={1.77777778}
                      lockAspectRatioExtraHeight={26}
                      className="work-window"
                      yOffset={300}
                      xOffset={0}
                      >
                       <p>This program requires Windows 95.</p>
                       <Button size="small" to="/work/">OK</Button>
                    </Window>
                  </MediaQuery>
              </MediaQuery>



            </div>
            <figure className="demoVideo">
              {reelVideo}
              <figcaption className="show-for-mobile container">&#8627; Tip: Turn your device horizontally to view video fullscreen.</figcaption>
            </figure>
          </div>
        </div>

        <div className="work-post-nav container">
          {
              previous &&
              <Button className="prev-btn" size="small" to={previous.fields.slug} rel="prev">
                Prev: {previous.frontmatter.title}
              </Button>
            }
            {
              next &&
              <Button className="next-btn" size="small" to={next.fields.slug} rel="next">
                Next: {next.frontmatter.title}
              </Button>
            }
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
