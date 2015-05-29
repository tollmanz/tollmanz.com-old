---
layout:     post
title:      "Velocity 2015 (Santa Clara): The Good Parts"
date:       2015-05-30 16:00:00
categories: conferences
---

**Andy Davies and Simon Hearne: What are third-party components doing to your site?**

It's no shock that third party components can cause performance concerns on our websites. Well, Andy and Simon shocked the hell out of me with the way that they demonstrated, through client experiences and research, just how bad these third party scripts really are. I've always loved Andy's emphasis on research and learn a lot from his work (Simon appears to be cut from the same cloth, but I only learned of him during this talk). As an example, Andy and Simon discussed the impact of Multivariate Testing (MVT; closely related to A/B testing) on websites. Through examining [HTTPArchive](http://httparchive.org/) data, they found that sites that load scripts for the purpose of MVT have higher [Speed Index](https://sites.google.com/a/webpagetest.org/docs/using-webpagetest/metrics/speed-index) (i.e., slower perceived performance) than sites that don't load such scripts. Further, they discussed third party components that load fourth party components, that load fifth party components, etc. You never know what these parties are loading on your site and they require constant vigilance and monitoring.

Andy and Simon told a few stories about how such components have caused breaking functionality on clients (e.g., MVT script not loading caused a login page to be missing form buttons). They use synthetic performance testing tools to try to detect a class of these issues whereby scripts are loading slowly or not loading at all. They even discussed ideas about automated detection of these events leading to removing the scripts from the site until the issue is resolved. This idea underscored the importance of using these third party components as progressive enhancement in order to allow your site to function without them in place.

During their talk they pointed to a number of tools that help with auditing and diagnosing issues with third party components. I love how actionable these tools are. Here are some of the gems:

* [Request Map Generator](http://requestmap.webperf.tools/): Built by Simon, this tools shows all of the third party domains that are loaded on a site. It helps you determine the chain of scripts that are loaded to more easily discovery which third party components are loading the fourth and fifth party components that are giving you headaches.
* [Web Performance Heat Map Generator](http://heatmap.webperf.tools/): Another Simon special, the Heat Map tool shows the areas of your site that are taking the longest to load. This tool helps you spot potential third party widgets that are slow to load on your site (as well as any first party slow spots). Simon [talks more about it](http://blog.webperf.ninja/2015/performance-heatmap/) on his blog.
* [JS Manners](http://jsmanners.com/): A self-described "YSlow for widgets" that helps audit third party scripts to determine if there might be security risks, performance issues, or compatibility problems.
* [SPOF-o-matic](https://chrome.google.com/webstore/detail/spof-o-matic/plikhggfbplemddobondkeogomgoodeg?hl=en-US): A Chrome extension by [WebPageTest.org](http://www.webpagetest.org/) creator Patrick Meenan for detecting and simulating Single Points of Failure (SPOF) on your site.
* [Ghostery](https://chrome.google.com/webstore/detail/ghostery/mlomiejdfkolichcflejclcbmpeaniij?hl=en): Andy and Simon recommended using Ghostery as a quick way to get a look at all of the tracking code your site is running. I have used the tool to block tracking code in the past, but never thought to use it as a tool for auditing my own work. It's a really clever way to get a quick look at tracking code you may not realize that you are loading.

I've always hating third party components on sites, but understand that they are often necessary. Andy and Simon's talk gave me a clear path toward beginning to audit and understand exactly how these components are affecting my site. I just love a talk that is so actionable.

* Slides: [http://www.slideshare.net/simonhearne/what-are-thirdpartiy-components-doing-to-your-site](http://www.slideshare.net/simonhearne/what-are-thirdpartiy-components-doing-to-your-site)
* Twitter: [@AndyDavies](https://twitter.com/AndyDavies) / [@simonhearne](https://twitter.com/simonhearne)
* Websites: [Webperf Ninja](http://blog.webperf.ninja/) / [Andy Davies](http://andydavies.me/)

**Zach Leatherman: The performance and usability of font loading**

Webfonts present a major challenge for the modern web. They are beautiful, but come with a steep performance cost. Zach's presentation expertly explained exactly how fonts are rendered in a browser. This explanation was one of the clearest and most detailed explanation of browser behavior with regard to font rendering that I've ever seen or read. The main message I got from Zach's presentation is that Flash of Invisible Text (FOIT) and Flash of Unstyled Text (FOUT) should be first class concerns when building a website and thus, you *must have a strategy for font rendering*. I particularly enjoyed his emphasis on FOIT more so than FOUT. He demonstrated that FOIT can obscure the meaning of your content, whereas FOUT only lacks the font decoration yet maintains the meaning of the content. He showed a screenshot of a headline from Slate that appeared to say "Mitt Romney is Officially Running for President", when the real headline was "Mitt Romney is Officially *not* Running for President". The "*not*" did not render on the page immediately because it required another font download because *not* was in italics. Thus, FOIT obscured the meaning of this text (how ironic would it be if the italics I just used in this paragraph also didn't render? #FOITception).


![](/media/images/mitt-president.png "Mitt Romney is Officially Running for President")

![](/media/images/mitt-not-president.png "Mitt Romney is Officially not Running for President")


* Slides: [https://speakerdeck.com/zachleat/the-performance-and-usability-of-font-loading](https://speakerdeck.com/zachleat/the-performance-and-usability-of-font-loading)
* Twitter: [@zachleat](https://twitter.com/zachleat)
* Website: [http://www.zachleat.com/](http://www.zachleat.com/web/)
