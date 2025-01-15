'use client';

import { Footer, LandingPageHeader } from '@layout';
import { Avatar, Box, Button, Card, Container, Typography, useMediaQuery } from '@mui/material';
import { type ReactElement } from 'react';
import { Animate, AnimateOnScroll, Parallax } from '@components/misc';
import { intro, landingPageGrimoire, landingPageSynopse, BLOB_API_URL } from '@constants';
import { landingPageBg as bg } from '@constants';
import { useTheme } from '@mui/material';
import { useRouter } from 'next/navigation';
import logo from '@public/magitech_logo.png'
import magitechCapa from '@public/magitech_capa.png'
import magitechCapaGrimorio from '@public/Magitech_capa_grimorio.png'
import profilePhoto from '@public/profile_photo.jpg'
import Image from 'next/image';
import Script from '@node_modules/next/script';


// CSS IMPORTS
import '@public/main/css/animate.css';
import '@public/main/css/bootstrap.css';
import '@public/main/css/flaticon.css';
import '@public/main/css/fontawesome-all.css';
import '@public/main/css/home-light-version.css';
import '@public/main/css/hover.css';
import '@public/main/css/jquery-ui.css';
import '@public/main/css/jquery.fancybox.min.css';
import '@public/main/css/owl.css';
import '@public/main/css/responsive.css';
import '@public/main/css/scrollbar.css';
import '@public/main/css/style.css';

export default function LandingPage(): ReactElement {
    const theme = useTheme()
    const matches = useMediaQuery(theme.breakpoints.down('md'))

    const router = useRouter()

    return (

        <>
            <div className="page-wrapper">
                {/* <div className="preloader"><div className="icon"></div></div> */}

                <header className="main-header header-style-two">
                    <div className="header-container">

                        <div className="header-top">
                            <div className="auto-container">
                                <div className="inner clearfix">
                                    <div className="top-left">
                                        <div className="top-text">Welcome to game developement studio</div>
                                    </div>

                                    <div className="top-right">
                                        <ul className="info clearfix">
                                            <li><a href="tel:666-888-0000">666 888 0000</a></li>
                                            <li><a href="mailto:needhelp@sintix.com">needhelp@sintix.com</a></li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="header-upper">
                            <div className="auto-container">
                                <div className="inner-container clearfix">
                                    <div className="logo-box">
                                        <div className="logo"><a href="index.html" title="Sintix - Digital Video Gaming and Consol HTML Template"><img src="images/logo.png" alt="Sintix - Digital Video Gaming and Consol HTML Template" title="Sintix - Digital Video Gaming and Consol HTML Template" /></a></div>
                                    </div>

                                    <div className="nav-outer clearfix">
                                        <div className="mobile-nav-toggler"><span className="icon flaticon-menu-2"></span></div>

                                        <nav className="main-menu navbar-expand-md navbar-light">
                                            <div className="collapse navbar-collapse show clearfix" id="navbarSupportedContent">
                                                <ul className="navigation clearfix">
                                                    <li className="current dropdown"><a href="index.html">Home</a>
                                                        <ul>
                                                            <li><a href="index.html">Home Page 01</a></li>
                                                            <li><a href="index-2.html">Home Page 02</a></li>
                                                            <li><a href="index-3.html">Home Page Light</a></li>
                                                            <li className="dropdown"><a href="index.html">Header Styles</a>
                                                                <ul>
                                                                    <li><a href="index.html">Header Type 01</a></li>
                                                                    <li><a href="index-2.html">Header Type 02</a></li>
                                                                    <li><a href="index-3.html">Header Type 03</a></li>
                                                                </ul>
                                                            </li>
                                                        </ul>
                                                    </li>
                                                    <li className="dropdown"><a href="about.html">About</a>
                                                        <ul>
                                                            <li><a href="about.html">About Us</a></li>
                                                            <li><a href="team.html">Our Team</a></li>
                                                        </ul>
                                                    </li>
                                                    <li className="dropdown"><a href="games.html">Games</a>
                                                        <ul>
                                                            <li><a href="games.html">All Games</a></li>
                                                            <li><a href="game-details.html">Dragon Fight</a></li>
                                                            <li><a href="game-details.html">Street Fighter</a></li>
                                                            <li><a href="game-details.html">Justice League</a></li>
                                                            <li><a href="game-details.html">The Mob Rules</a></li>
                                                            <li><a href="game-details.html">Mafia Mystrey</a></li>
                                                        </ul>
                                                    </li>
                                                    <li><a href="gallery.html">Gallery</a></li>
                                                    <li className="dropdown"><a href="blog.html">Blog</a>
                                                        <ul>
                                                            <li><a href="blog.html">Blog Sidebar</a></li>
                                                            <li><a href="blog-grid.html">Blog Grid View</a></li>
                                                            <li><a href="blog-single.html">Blog Single</a></li>
                                                        </ul>
                                                    </li>
                                                    <li><a href="contact.html">Contact</a></li>
                                                </ul>
                                            </div>
                                        </nav>

                                        <ul className="social-links clearfix">
                                            <li><a href="#"><span className="fab fa-twitter"></span></a></li>
                                            <li><a href="#"><span className="fab fa-facebook-square"></span></a></li>
                                            <li><a href="#"><span className="fab fa-linkedin-in"></span></a></li>
                                            <li><a href="#"><span className="fab fa-pinterest-p"></span></a></li>
                                        </ul>

                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="sticky-header">
                        <div className="auto-container clearfix">
                            <div className="logo pull-left">
                                <a href="index.html" title=""><img src="images/sticky-logo.png" alt="" title="" /></a>
                            </div>
                            <div className="pull-right">
                                <nav className="main-menu clearfix">

                                    {/* MAIN MENU JS */}

                                </nav>
                            </div>
                        </div>
                    </div>

                    {/* MOBILE MENU */}
                    <div className="mobile-menu">
                        <div className="menu-backdrop"></div>
                        <div className="close-btn"><span className="icon flaticon-cancel"></span></div>

                        <nav className="menu-box">
                            <div className="nav-logo"><a href="index.html"><img src="images/logo.png" alt="" title="" /></a></div>
                            <div className="menu-outer">
                            
                                {/* MAIN MENU JS */}

                            </div>

                            <div className="social-links">
                                <ul className="clearfix">
                                    <li><a href="#"><span className="fab fa-twitter"></span></a></li>
                                    <li><a href="#"><span className="fab fa-facebook-square"></span></a></li>
                                    <li><a href="#"><span className="fab fa-pinterest-p"></span></a></li>
                                    <li><a href="#"><span className="fab fa-instagram"></span></a></li>
                                    <li><a href="#"><span className="fab fa-youtube"></span></a></li>
                                </ul>
                            </div>
                        </nav>
                    </div>
                    {/* END MOBIEL MENU */}
                </header>

                <section className="banner-section banner-style-two">
                    <div className="banner-carousel owl-theme owl-carousel">

                        <div className="slide-item">
                            <div className="image-layer" style={{ backgroundImage: 'url(images/main-slider/2.jpg)' }}></div>

                            <div className="auto-container">
                                <div className="content-box">
                                    <div className="content">
                                        <div className="upper-subtitle">- New game launch -</div>
                                        <h1><span>Dragon Fight</span></h1>
                                        <div className="lower-subtitle">- available in the market -</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="slide-item">
                            <div className="image-layer" style={{ backgroundImage: 'url(images/main-slider/2.jpg)' }}></div>

                            <div className="auto-container">
                                <div className="content-box">
                                    <div className="content">
                                        <div className="upper-subtitle">- New game launch -</div>
                                        <h1><span>Dragon Fight</span></h1>
                                        <div className="lower-subtitle">- available in the market -</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="slide-item">
                            <div className="image-layer" style={{ backgroundImage: 'url(images/main-slider/2.jpg)' }}></div>

                            <div className="auto-container">
                                <div className="content-box">
                                    <div className="content">
                                        <div className="upper-subtitle">- New game launch -</div>
                                        <h1><span>Dragon Fight</span></h1>
                                        <div className="lower-subtitle">- available in the market -</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </section>

                <section className="game-view-section">
                    <div className="top-pattern-layer"></div>
                    <div className="auto-container">

                        <div className="platforms">
                            <div className="row clearfix">
                                
                                <div className="platofrm-block col-lg-3 col-md-4 col-sm-6">
                                    <div className="inner">
                                        <div className="icon-box"><span className="flaticon-play"></span></div>
                                        <div className="p-title">buy on <br />play station</div>
                                        <a href="#" className="over-link"></a>
                                    </div>
                                </div>
                                
                                <div className="platofrm-block col-lg-3 col-md-4 col-sm-6">
                                    <div className="inner">
                                        <div className="icon-box"><span className="flaticon-xbox-logo"></span></div>
                                        <div className="p-title">buy on <br />xbox one</div>
                                        <a href="#" className="over-link"></a>
                                    </div>
                                </div>
                                
                                <div className="platofrm-block col-lg-3 col-md-4 col-sm-6">
                                    <div className="inner">
                                        <div className="icon-box"><span className="flaticon-steam-logo"></span></div>
                                        <div className="p-title">buy on <br />Steam / VR</div>
                                        <a href="#" className="over-link"></a>
                                    </div>
                                </div>
                                
                                <div className="platofrm-block col-lg-3 col-md-4 col-sm-6">
                                    <div className="inner">
                                        <div className="icon-box"><span className="flaticon-playstore-2"></span></div>
                                        <div className="p-title">buy on <br />playstore</div>
                                        <a href="#" className="over-link"></a>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="game-trailer">
                            
                            <div className="sec-title centered"><h2>Watch the trailer</h2><span className="bottom-curve"></span></div>

                            <div className="trailer-video-box">
                                <figure className="image"><img src="images/resource/video-trailer-image.jpg" alt="" title="" /></figure>
                                <a href="https://www.youtube.com/watch?v=ticp6ScuyLY" className="lightbox-image over-link"><span className="icon fa fa-play"></span></a>
                            </div>

                        </div>

                        <div className="game-awards">
                            
                            <div className="sec-title centered"><h2>SPECIAL awards</h2><span className="bottom-curve"></span></div>

                            <div className="awards">
                                <div className="row clearfix">
                                    
                                    <div className="award-block col-lg-3 col-md-6 col-sm-12">
                                        <div className="inner">
                                            <div className="upper-title">design <br />award</div>
                                            <div className="lower-title">winner 2018</div>
                                        </div>
                                    </div>
                                    
                                    <div className="award-block col-lg-3 col-md-6 col-sm-12">
                                        <div className="inner">
                                            <div className="upper-title">Apple tv</div>
                                            <div className="lower-title">game of the <br />year</div>
                                        </div>
                                    </div>
                                    
                                    <div className="award-block col-lg-3 col-md-6 col-sm-12">
                                        <div className="inner">
                                            <div className="upper-title">google play <br />best</div>
                                            <div className="lower-title">developer</div>
                                        </div>
                                    </div>
                                    
                                    <div className="award-block col-lg-3 col-md-6 col-sm-12">
                                        <div className="inner">
                                            <div className="upper-title">MGA finalist</div>
                                            <div className="lower-title">best audio <br />visual</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>

                    </div>
                </section>

                <section className="reviews-section">
                    <div className="top-pattern-layer-dark"></div>
                    <div className="bottom-pattern-layer-dark"></div>

                    <div className="auto-container">
                        
                        <div className="sec-title"><h2>Players reviews</h2><span className="bottom-curve"></span></div>

                        <div className="testimonial-slider carousel-outer clearfix">

                            <div className="thumb-carousel-box">
                                <ul className="thumb-carousel owl-carousel owl-theme">
                                    <li className="thumb"><img src="images/resource/rev-thumb-1.jpg" alt="" /></li>
                                    <li className="thumb"><img src="images/resource/rev-thumb-2.jpg" alt="" /></li>
                                    <li className="thumb"><img src="images/resource/rev-thumb-3.jpg" alt="" /></li>
                                    <li className="thumb"><img src="images/resource/rev-thumb-1.jpg" alt="" /></li>
                                    <li className="thumb"><img src="images/resource/rev-thumb-2.jpg" alt="" /></li>
                                    <li className="thumb"><img src="images/resource/rev-thumb-3.jpg" alt="" /></li>
                                </ul>
                            </div>

                            <div className="text-carousel owl-carousel owl-theme">
                               
                                <div className="slide-item">
                                    <div className="inner">
                                        <div className="text">This is due to their excellent service competitive pricing and customer support. It’s throughly refresing to get such a personal touch. There are many variations of passages of available, but the majority have suffered alteration in some form by injected humour.</div>
                                        <div className="info clearfix"><span className="name">Jessica brown</span> &ensp;-&ensp; <span className="date">25 may, 2019</span></div>
                                    </div>
                                </div>
                               
                                <div className="slide-item">
                                    <div className="inner">
                                        <div className="text">This is due to their excellent service competitive pricing and customer support. It’s throughly refresing to get such a personal touch. There are many variations of passages of available, but the majority have suffered alteration in some form by injected humour.</div>
                                        <div className="info clearfix"><span className="name">Kevin Smith</span> &ensp;-&ensp; <span className="date">25 may, 2019</span></div>
                                    </div>
                                </div>
                               
                                <div className="slide-item">
                                    <div className="inner">
                                        <div className="text">This is due to their excellent service competitive pricing and customer support. It’s throughly refresing to get such a personal touch. There are many variations of passages of available, but the majority have suffered alteration in some form by injected humour.</div>
                                        <div className="info clearfix"><span className="name">Christine eve</span> &ensp;-&ensp; <span className="date">25 may, 2019</span></div>
                                    </div>
                                </div>
                               
                                <div className="slide-item">
                                    <div className="inner">
                                        <div className="text">This is due to their excellent service competitive pricing and customer support. It’s throughly refresing to get such a personal touch. There are many variations of passages of available, but the majority have suffered alteration in some form by injected humour.</div>
                                        <div className="info clearfix"><span className="name">Jessica brown</span> &ensp;-&ensp; <span className="date">25 may, 2019</span></div>
                                    </div>
                                </div>
                               
                                <div className="slide-item">
                                    <div className="inner">
                                        <div className="text">This is due to their excellent service competitive pricing and customer support. It’s throughly refresing to get such a personal touch. There are many variations of passages of available, but the majority have suffered alteration in some form by injected humour.</div>
                                        <div className="info clearfix"><span className="name">Kevin Smith</span> &ensp;-&ensp; <span className="date">25 may, 2019</span></div>
                                    </div>
                                </div>
                               
                                <div className="slide-item">
                                    <div className="inner">
                                        <div className="text">This is due to their excellent service competitive pricing and customer support. It’s throughly refresing to get such a personal touch. There are many variations of passages of available, but the majority have suffered alteration in some form by injected humour.</div>
                                        <div className="info clearfix"><span className="name">Christine eve</span> &ensp;-&ensp; <span className="date">25 may, 2019</span></div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </section>
            
                <section className="featured-game">
                    <div className="bottom-pattern-layer"></div>

                    <div className="auto-container">

                        <div className="row clearfix">
                            
                            <div className="text-column col-lg-6 col-md-12 col-sm-12">
                                <div className="inner">
                                    <div className="sec-title"><h2>spirit of a warrior who battled dragons</h2><span className="bottom-curve"></span></div>
                                    <div className="text">Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries. There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form by injected humour.</div>
                                    <div className="link-box"><a href="game-details.html" className="theme-btn btn-style-one"><span className="btn-title">Buy game Now</span></a></div>
                                </div>
                            </div>
                            
                            <div className="image-column col-lg-6 col-md-12 col-sm-12">
                                <div className="inner wow fadeInLeft" data-wow-delay="0ms" data-wow-duration="1500ms">
                                    <div className="image-box"><img src="images/resource/featured-image-2.png" alt="" title="" /></div>
                                </div>
                            </div>
                        </div>

                    </div>
                </section>
                
                <section className="parallax-section">
                    <div className="image-layer" style={{ backgroundImage: 'url(images/background/parallax-bg.jpg' }}></div>

                    <div className="auto-container">
                        <div className="content-box wow zoomInStable" data-wow-delay="0ms" data-wow-duration="2500ms">
                            <h2>THE WORLD NEEDS HEROES</h2>
                            <div className="text-box">Slow down time, rain destruction from above in a jet-powered armor suit, or pilot a superpowered hamster ball: In Dragon Fight, every hero has a unique set of devastating abilities.</div>
                        </div>
                    </div>
                </section>
                
                <section className="faq-section">
                    
                    <div className="about-content">
                        <div className="auto-container">
                            <div className="row clearfix">
                                
                                <div className="text-column col-lg-6 col-md-12 col-sm-12">
                                    <div className="inner wow fadeInRight" data-wow-delay="0ms" data-wow-duration="1500ms">
                                        <div className="sec-title"><h2>discover sintix</h2><span className="bottom-curve"></span></div>
                                        <div className="text">
                                            <p>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries. There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form by injected humour.</p>
                                            <p>Lorem ipsumum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.</p>
                                        </div>
                                        <div className="link-box"><a href="#" className="theme-btn btn-style-one"><span className="btn-title">view games</span></a></div>
                                    </div>
                                </div>
                                
                                <div className="image-column col-lg-6 col-md-12 col-sm-12">
                                    <div className="inner wow fadeInLeft" data-wow-delay="0ms" data-wow-duration="1500ms">
                                        <div className="image-box"><img src="images/resource/featured-image-2.jpg" alt="" title="" /></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="top-pattern-layer"></div>
                    <div className="auto-container">
                        
                        <div className="sec-title centered"><h2>Question & Answers</h2><span className="bottom-curve"></span></div>

                        <div className="faq-container">
                            <div className="accordion-box">
                                
                                <div className="accordion block current wow fadeInUp" data-wow-delay="0ms" data-wow-duration="1500ms">
                                    <div className="acc-btn active">How to earn point in the game? <div className="icon flaticon-cross"></div></div>
                                    <div className="acc-content">
                                        <div className="content">
                                            <div className="text">Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries. There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form by injected humour.</div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="accordion block wow fadeInUp" data-wow-delay="100ms" data-wow-duration="1500ms">
                                    <div className="acc-btn">How to beat team based shooters? <div className="icon flaticon-cross"></div></div>
                                    <div className="acc-content">
                                        <div className="content">
                                            <div className="text">Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries. There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form by injected humour.</div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="accordion block wow fadeInUp" data-wow-delay="200ms" data-wow-duration="1500ms">
                                    <div className="acc-btn">who lives to cause chaos and destruction? <div className="icon flaticon-cross"></div></div>
                                    <div className="acc-content">
                                        <div className="content">
                                            <div className="text">Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries. There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form by injected humour.</div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="accordion block wow fadeInUp" data-wow-delay="300ms" data-wow-duration="1500ms">
                                    <div className="acc-btn">A cyborg ninja and deadly warrior? <div className="icon flaticon-cross"></div></div>
                                    <div className="acc-content">
                                        <div className="content">
                                            <div className="text">Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries. There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form by injected humour.</div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="accordion block wow fadeInUp" data-wow-delay="400ms" data-wow-duration="1500ms">
                                    <div className="acc-btn">which hero has a unique set of devastating abilities? <div className="icon flaticon-cross"></div></div>
                                    <div className="acc-content">
                                        <div className="content">
                                            <div className="text">Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries. There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form by injected humour.</div>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>

                    </div>

                </section>

                <footer className="main-footer">

                    <div className="footer-bottom">
                        <div className="outer-container">
                            <div className="bottom-shape-box"><div className="bg-shape"></div></div>

                            <div className="auto-container">
                                <div className="scroll-to-top scroll-to-target" data-target="html"><span className="flaticon-up-arrow"></span></div>
                                <div className="row clearfix">
                                    <div className="column col-lg-6 col-md-12 col-sm-12">
                                        <div className="copyright"><span className="logo-icon"></span> &copy; Copyrights 2019 <a href="#">Sintix</a> - All Rights Reserved</div>
                                    </div>
                                    <div className="column col-lg-6 col-md-12 col-sm-12">
                                        <div className="social-links">
                                            <ul className="default-social-links">
                                                <li><a href="#"><span className="fab fa-twitter"></span></a></li>
                                                <li><a href="#"><span className="fab fa-facebook-square"></span></a></li>
                                                <li><a href="#"><span className="fab fa-pinterest-p"></span></a></li>
                                                <li><a href="#"><span className="fab fa-instagram"></span></a></li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>

                </footer>

            </div>

            <div className="scroll-to-top scroll-to-target" data-target="html"><span className="flaticon-up-arrow"></span></div>

            <Script src="main/js/jquery.js"></Script>
            <Script src="main/js/popper.min.js"></Script>
            <Script src="main/js/bootstrap.min.js"></Script>
            <Script src="main/js/jquery-ui.js"></Script>
            <Script src="main/js/jquery.fancybox.js"></Script>
            <Script src="main/js/owl.js"></Script>
            <Script src="main/js/appear.js"></Script>
            <Script src="main/js/wow.js"></Script>
            <Script src="main/js/scrollbar.js"></Script>
            <Script src="main/js/script.js"></Script>
        </>

    // <>
    //     <LandingPageHeader />
    //     <Animate style={{ userSelect: 'none' }} isVisible animationIn='fadeIn'>
    //         <Parallax bgImage={bg} strength={300} blur={{ min: -3, max: 3 }}>
    //             <Box sx={{
    //                 display: 'flex',
    //                 alignItems: 'center',
    //                 width: !matches ? '100%' : '50%',
    //                 height: '90vh'
    //             }}>
    //                 <Box  
    //                     display='flex'
    //                     p='5rem'
    //                     sx={{ userSelect: 'none' }}
    //                 >
    //                     <Animate isVisible={true} animationIn='fadeInDown' animationInDelay={500} animationInDuration={1500}>
    //                         <Box 
    //                             display='flex'
    //                             flexDirection={!matches ? 'row' : 'column'}
    //                             alignItems='center'
    //                             gap={5}
    //                         >
    //                             {!matches && (
    //                                 <Image 
    //                                     src={logo} 
    //                                     alt="Magitech Logo"
    //                                     height={150}
    //                                 /> 
    //                             )}
    //                             <Typography
    //                                 fontSize={!matches ? '10rem' : '6.5rem'} 
    //                                 fontFamily='WBZ'
    //                                 textAlign={!matches ? 'initial' : 'center'}
    //                             >
    //                                 Magitech II
    //                             </Typography>
    //                         </Box>
    //                         <Typography 
    //                             width={!matches ? '65%' : '100%'}
    //                             mt={!matches ? 0 : 5}
    //                             color='#eee' 
    //                             fontSize='1.5rem' 
    //                             fontFamily='Inter'
    //                         >
    //                             Um RPG de mesa mágico e futurista que prioriza a diversão, estética, automação e criatividade! Se junte a esta incrível jornada!
    //                         </Typography>
    //                         <Button 
    //                             variant="contained"
    //                             color="secondary"
    //                             sx={{ mt: '2rem', zIndex: 999 }}
    //                             onClick={() => { router.push('/api/auth/signin') }}
    //                         >
    //                             Comece Já!
    //                         </Button>
    //                     </Animate>
    //                 </Box>
    //             </Box>
    //         </Parallax>
    //     </Animate>
    //     <Box position='relative'>
    //         <Box
    //             position='absolute'
    //             bottom='100%'
    //             height='300px'
    //             width='100%'
    //             left={0}
    //             sx={{ background: 'linear-gradient(to top, #101621, transparent)' }}
    //         />
    //         <Box height='8rem' />
    //         <Container sx={{ p: 5, gap: 3 }}>
    //             <Box mb={30}>
    //                 <Typography variant='h3' fontFamily='WBZ' textAlign='center' p={5} width='100%'>
    //                     Sobre
    //                 </Typography>
    //                 <AnimateOnScroll animateOnce animation={!matches ? 'fadeInDown' : 'fadeInLeft'}>
    //                     <Box 
    //                         display='flex'
    //                         justifyContent='center'
    //                         flexDirection={!matches ? 'row' : 'column'}
    //                         alignItems='center'
    //                         width='100%'
    //                         gap={4}
    //                         p={3}
    //                     >
    //                         <Card 
    //                             sx={{
    //                                 height: '25rem',
    //                                 display: 'flex',
    //                                 flexDirection: 'column',
    //                                 bgcolor: 'background.paper',
    //                                 width: !matches ? '33%' : '100%',
    //                                 borderRadius: 4,
    //                                 p: 3,
    //                                 gap: 2
    //                             }}
    //                             elevation={12}
    //                         >
    //                             <Typography 
    //                                 variant='h5' 
    //                                 fontWeight={900}
    //                                 textAlign='center'>O que é?</Typography>
    //                             <Typography>
    //                                 Magitech RPG é um sistema de RPG de mesa feito por Vitor Hugo Rodrigues dos Santos inspirado em D&D, Tormenta, Order & Chaos,
    //                                 Ordem Paranormal, entre outros sistemas de RPG. Para quem não sabe, RPG (abreviação de Role Playing Game),
    //                                 é um jogo de interpretação de papéis, onde aqueles que participam são divididos entre o Mestre e os Jogadores.</Typography>
    //                         </Card>
    //                         <Card 
    //                             sx={{
    //                                 height: '25rem',
    //                                 display: 'flex',
    //                                 flexDirection: 'column',
    //                                 bgcolor: 'background.paper',
    //                                 width: !matches ? '33%' : '100%',
    //                                 borderRadius: 4,
    //                                 p: 3,
    //                                 gap: 2
    //                             }}
    //                             elevation={12}
    //                         >
    //                             <Typography 
    //                                 variant='h5' 
    //                                 fontWeight={900}
    //                                 textAlign='center'>Porquê?</Typography>
    //                             <Typography>
    //                                 Para quem joga RPG de mesa, sabe o quão trabalho e burocrático é jogar uma sessão, principalmente se você for o Mestre.
    //                                 É necessário criar e anotar fichas, programar sessoes, anotar detalhes em combate ou no mapa e muito mais.
    //                                 Tendo em vista este problema, o Magitech foi desenvolvido para auxiliar não só Mestre, mas também para os jogadores no que for preciso.    
    //                             </Typography>
    //                         </Card>
    //                         <Card 
    //                             sx={{
    //                                 height: '25rem',
    //                                 display: 'flex',
    //                                 flexDirection: 'column',
    //                                 bgcolor: 'background.paper',
    //                                 width: !matches ? '33%' : '100%',
    //                                 borderRadius: 4,
    //                                 p: 3,
    //                                 gap: 2
    //                             }}
    //                             elevation={12}
    //                         >
    //                             <Typography 
    //                                 variant='h5' 
    //                                 fontWeight={900}
    //                                 textAlign='center'>Como funciona?</Typography>
    //                             <Typography>
    //                                 Este site é uma aplicação web para auxílio na jogatina de Magitech RPG.
    //                                 Basicamente, é um sistema que integra fichas e sessões da mesa de RPG e automatiza o que antes precisava ser feito no papel.
    //                                 As regras do RPG estão descritas no Guia que está disponível para download logo abaixo.
    //                             </Typography>
    //                         </Card>
    //                     </Box>
    //                 </AnimateOnScroll>
    //             </Box>

    //             <Box mb={30}>
    //                 <Typography variant='h3' fontFamily='WBZ' textAlign='center' p={5} width='100%'>
    //                     Quem somos
    //                 </Typography>
    //                 <AnimateOnScroll animateOnce animation='fadeInDown'>
    //                     <Box 
    //                         display='flex'
    //                         flexDirection='column'
    //                         justifyContent='center'
    //                         alignItems='center'
    //                         width='100%'
    //                     >
    //                         <Avatar sx={{ width: 200, height: 200 }}>
    //                             <Image
    //                                 src={profilePhoto}
    //                                 alt='Profile Photo'
    //                                 width={200}
    //                                 style={{
    //                                     backgroundSize: 'cover',
    //                                     backgroundRepeat: 'no-repeat'
    //                                 }} 
    //                             />
    //                         </Avatar>
    //                         <Typography 
    //                             color='secondary' 
    //                             fontWeight={900} 
    //                             fontSize='1.25rem'
    //                             mt={3}
    //                             textAlign='center'
    //                         >VITOR HUGO RODRIGUES DOS SANTOS</Typography>
    //                         <Typography 
    //                             color='secondary' 
    //                             mt={3}
    //                             textAlign='center'
    //                             width='25%'
    //                         >Desenvolvedor Web & Técnico em Desenvolvimento de Sistemas</Typography>
    //                         <Typography 
    //                             mt={3}
    //                             textAlign='center'
    //                             width='50%'
    //                         >Apenas eu mesmo, Vitor santos. Jovem sonhador que está ingressando no mercado de trabalho de TI fazendo novos projetos como este.</Typography>
    //                     </Box>
    //                 </AnimateOnScroll>
    //             </Box>

    //             <Box mb={30}>
    //                 <Box p={5} width='100%'>  
    //                     <Typography variant='h3' fontFamily='WBZ' textAlign='center'>Obtenha o Guia de Regras</Typography>
    //                 </Box>
    //                 <AnimateOnScroll animateOnce animation='fadeInLeft'>
    //                     <Box
    //                         display='flex'
    //                         alignItems='center'
    //                         justifyContent='center'
    //                         flexDirection={!matches ? 'row' : 'column'}
    //                         width='100%' 
    //                         border={`1px solid ${theme.palette.primary.light}`}
    //                         borderRadius={2}
    //                         p={!matches ? 10 : 3}
    //                         gap={5}
    //                     >
    //                         <Box
    //                             width={!matches ? '50%' : '100%'}
    //                             sx={{
    //                                 display: 'flex',
    //                                 justifyContent: 'center'
    //                             }}
    //                         >
    //                             <Image
    //                                 src={magitechCapa}
    //                                 alt="Magitech Capa"
    //                                 onClick={() => {
    //                                     window.open(BLOB_API_URL + 'Magitech RPG - Livro de Regras.pdf')
    //                                 }}
    //                                 onMouseOver={e => {
    //                                     e.currentTarget.style.transform = 'scale(1.1)'
    //                                 }}
    //                                 onMouseLeave={e => {
    //                                     e.currentTarget.style.transform = 'scale(1)'
    //                                 }}
    //                                 style={{
    //                                     height: '100%',
    //                                     width: !matches ? '50%' : '100%',
    //                                     boxShadow: theme.shadows[10],
    //                                     cursor: 'pointer',
    //                                     transition: 'ease-in-out .3s'
    //                                 }}

    //                             />
    //                         </Box>
    //                         <Box display='flex' gap={1} height='100%' width={!matches ? '50%' : '100%'}>
    //                             <Typography position='relative' bottom='1.5rem' fontSize='4rem' fontFamily='WBZ'>E</Typography>
    //                             <Box display='flex' gap={5} flexDirection='column' justifyContent='space-between'>
    //                                 <Typography>{landingPageSynopse}</Typography>
    //                                 <Box>
    //                                     <Button 
    //                                         sx={{ width: '33%' }} 
    //                                         variant='contained' 
    //                                         color={'terciary' as any}
    //                                         onClick={() => { window.open(BLOB_API_URL + 'Magitech RPG - Livro de Regras.pdf') }}
    //                                     >
    //                                         Baixe agora
    //                                     </Button>
    //                                 </Box>
    //                             </Box>
    //                         </Box>
    //                     </Box>
    //                 </AnimateOnScroll>
    //             </Box>

    //             <Box mb={30}>
    //                 <Box p={5} width='100%'>  
    //                     <Typography variant='h3' fontFamily='WBZ' textAlign='center'>Obtenha o Grimorio</Typography>
    //                 </Box>
    //                 <AnimateOnScroll animateOnce animation='fadeInRight'>

    //                     <Box
    //                         display='flex'
    //                         alignItems='center'
    //                         justifyContent='center'
    //                         flexDirection={!matches ? 'row' : 'column-reverse'}
    //                         width='100%' 
    //                         border={`1px solid ${theme.palette.primary.light}`}
    //                         borderRadius={2}
    //                         p={!matches ? 10 : 3}
    //                         gap={5}
    //                     >
    //                         <Box 
    //                             display='flex' gap={1} 
    //                             height='100%'
    //                             width={!matches ? '50%' : '100%'}
    //                         >
    //                             <Typography position='relative' bottom='1.5rem' fontSize='4rem' fontFamily='WBZ'>M</Typography>
    //                             <Box display='flex' gap={5} flexDirection='column' justifyContent='space-between'>
    //                                 <Typography>{landingPageGrimoire}</Typography>
    //                                 <Box>
    //                                     <Button 
    //                                         sx={{ width: '33%' }} 
    //                                         variant='contained' 
    //                                         color={'terciary' as any}
    //                                         onClick={() => { window.open(BLOB_API_URL + 'Magitech RPG - Grimório.pdf') }}
    //                                     >
    //                                         Baixe agora
    //                                     </Button>
    //                                 </Box>
    //                             </Box>
    //                         </Box>
    //                         <Box
    //                             width={!matches ? '50%' : '100%'}
    //                             sx={{
    //                                 display: 'flex',
    //                                 justifyContent: 'center'
    //                             }}
    //                         >
    //                             <Image
    //                                 src={magitechCapaGrimorio}
    //                                 alt="Magitech Capa Grimório"
    //                                 onClick={() => {
    //                                     window.open(BLOB_API_URL + 'Magitech RPG - Grimório.pdf')

    //                                 }}
    //                                 onMouseOver={e => {
    //                                     e.currentTarget.style.transform = 'scale(1.1)'
    //                                 }}
    //                                 onMouseLeave={e => {
    //                                     e.currentTarget.style.transform = 'scale(1)'
    //                                 }}
    //                                 style={{
    //                                     height: '100%',
    //                                     width: !matches ? '50%' : '100%',
    //                                     boxShadow: theme.shadows[10],
    //                                     cursor: 'pointer',
    //                                     transition: 'ease-in-out .3s'
    //                                 }}

    //                             />
    //                         </Box>
    //                     </Box>
    //                 </AnimateOnScroll>
    //             </Box>

    //             <Box mb={30}>
    //                 <Box p={5} width='100%'>  
    //                     <Typography variant='h3' fontFamily='WBZ' textAlign='center'>Sinopse</Typography>
    //                 </Box>
    //                 <AnimateOnScroll animateOnce animation='fadeInUp'>  

    //                     <Box
    //                         display='flex'
    //                         alignItems='center'
    //                         justifyContent='center'
    //                         width='100%' 
    //                         border={`1px solid ${theme.palette.primary.light}`}
    //                         borderRadius={2}
    //                         p={!matches ? 10 : 3}
    //                         gap={5}
    //                     >
    //                         <Box display='flex' gap={1}>
    //                             <Typography position='relative' bottom='1.5rem' fontSize='4rem' fontFamily='WBZ'>M</Typography>
    //                             <Typography whiteSpace='pre-wrap'>
    //                                 {intro}
    //                             </Typography>
    //                         </Box>
    //                     </Box>
    //                 </AnimateOnScroll>
    //             </Box>                       
    //         </Container>
    //         <Footer />
    //     </Box>
    // </>
    )
}
