import React from 'react'
import { Link } from 'gatsby'
import styled from 'styled-components'
import { media, mediamax } from '../../utils/media'

const Button = styled(({small, tiny, ...props}) => <Link {...props} />
    )`
    transform: translate3d(0,0,0);
    outline: 0;
    box-shadow: none;
    display: inline-block;
    transition: all 0.125s ease-in-out;
    position: relative;
    backface-visibility: hidden;
    text-decoration: none;
    background-color: #111;
    background-color: var(--bg);
    line-height: 1.33333;
    letter-spacing: .1em;
    text-transform: uppercase;
    font-size: ${ props => ( props.tiny ? '12px' : props.small ? '15px' : '18px' ) }; 
    padding: ${ props => ( props.tiny ? '.75em 1.25em .5em' : props.small ? '.5em 2.5em' : '1.3em 3em 1.1em' ) };
    ${media.medium`
        font-size: ${ props => ( props.tiny ? '13px' : props.small ? '17px' : '24px' ) };
        padding: ${ props => ( props.tiny ? '.72em 1.5em .5em' : props.small ? '.62em 3.5em .4em' : '1.3em 3em 1.1em' ) };
    `}
    &:before, &:after {
        transition: all 0.125s ease-in-out;
        content: ' ';
        width: 100%;
        height: 100%;
        position: absolute;
        top: 0;
        left: 0;
    }
    &:before {
        background: none;
        z-index: -1;
    }
    &:after {
        opacity: 1;
        z-index: -2;
        border: 2px solid #ff0;
        border: 2px solid var(--primary);
        transform: translate3d(0,0,0);
    }
    &:hover {
        background: #111;
        background: var(--bg);
        color: #000;
        color: var(--secondary);
        transform: translate3d(${ props => ( props.tiny ? '6px, -6px, 0' : props.small ? '8px, -8px, 0' : '10px, -10px, 0' ) });
        padding: ${ props => ( props.tiny ? '.75em 1.5em .5em' : props.small ? '.5em 2.5em' : '1.3em 3em 1.1em' ) };
        ${media.medium`
            padding: ${ props => ( props.tiny ? '.72em 1.5em .5em' : props.small ? '.62em 3.5em .4em' : '1.3em 3em 1.1em' ) };
        `}
    }
    &:hover:before {
        background: #ff0;
        background: var(--primary);
    }
    &:hover:after {
        transform: translate3d(${ props => ( props.tiny ? '-6px, 6px, 0' : props.small ? '-8px, 8px, 0' : '-10px, 10px, 0' ) });
        opacity: .4;
        border: 2px solid #ff0;
        border: 2px solid var(--primary);
    }
    &:active {
        transform: translate3d(0,0,0);
    }
    &:active:after {
        transform: translate3d(0,0,0);
    }
`;


export default Button
