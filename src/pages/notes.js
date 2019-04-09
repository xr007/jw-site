import React from 'react'
import { Link, graphql } from 'gatsby'
import get from 'lodash/get'
import Helmet from 'react-helmet'
import Layout from '../components/layout'
import Button from '../components/Button/button.js'
import Window from '../components/Window/window.js'
import MediaQuery from 'react-responsive'

class NotesIndex extends React.Component {
  defaultTheme() {
    document.documentElement.style.setProperty('--text-color', '#ffffff');
    document.documentElement.style.setProperty('--bg', '#151515');
    document.documentElement.style.setProperty('--bg-faded', '21, 21, 21');
    document.documentElement.style.setProperty('--primary', '#ff0');
    document.documentElement.style.setProperty('--primary-faded', 'rgba(255,255,0,.78)');
    document.documentElement.style.setProperty('--secondary', '#2828ef');
    document.documentElement.style.setProperty('--secondary-faded', '#1414ab');
    document.documentElement.style.setProperty('--window-border', '190,190,190');
    document.documentElement.style.setProperty('--window-title', '0,0,0');
    document.documentElement.style.setProperty('--footer-bg', '#000');
    let metaThemeColor = document.querySelector("meta[name=theme-color]");
    metaThemeColor.setAttribute("content", getComputedStyle(document.documentElement).getPropertyValue('--bg'));
  }
  componentDidMount() {
    this.defaultTheme();
  }
  componentWillUnmount() {
    
  }

  render() {
    const siteTitle = get(this, 'props.data.site.siteMetadata.title')
    const siteDescription = get(
      this,
      'props.data.site.siteMetadata.description'
    )
    const posts = get(this, 'props.data.allMarkdownRemark.edges')
    return (
      <Layout location={this.props.location}>
        <Helmet
          meta={[{ name: 'description', content: siteDescription }]}
          title={`Notes - ${siteTitle}`}
          >
        <body />
        </Helmet>
        <div className="index-title centered-title preload container">
          <h1 className="title">Notes</h1>
        </div>
           <div className="note-index-container">
           {posts.map(({ node: post }) => {
                const title = get(post, 'frontmatter.title') || post.fields.slug
               return (
                <div className="note-card" key={post.id}>
                  <h2 className="title h2">{post.frontmatter.title}</h2>
                  <p>{post.frontmatter.date}</p>
                  <Button size="tiny" to={post.fields.slug} inlineicon="right">View Note <span>&rarr;</span></Button>
                </div>
               )
             })}
           </div>
      </Layout>
    )
  }
}

export default NotesIndex

export const pageQuery = graphql`
  query {
    site {
      siteMetadata {
        title
        description
      }
    }
    allMarkdownRemark(
      sort: { fields: [frontmatter___date], order: DESC },
      filter: {
        fileAbsolutePath: {regex: "\/notes/"}
        frontmatter: { publish: { eq:true }}
      }
      ){
      edges {
        node {
          excerpt(pruneLength: 50)
          id
          fields {
            slug
          }
          frontmatter {
            publish
            date(formatString: "MMMM DD, YYYY")
            title
          }
        }
      }
    }
  }
`
