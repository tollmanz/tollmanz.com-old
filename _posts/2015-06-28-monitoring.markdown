---
layout:     post
title:      "An Almost Free, DIY Solution for Monitoring Performance Data"
date:       2015-06-28 23:00:00
categories: monitoring, performance
---

Real User Monitoring (RUM) is an important aspect of performance optimization. RUM allows you to track and analyze how real world users of your web properties *actually* experience your website. RUM is an important part of performance monitoring as you collect the real experiences of your users, as opposed to the contrived data inherit in synthetic monitoring (e.g., [Web Page Test](http://www.webpagetest.org); it's still really important!). If you've ever used Google Analytics, you've engaged in RUM before; however, RUM for web performance is more difficult because there is no service like Google Analytics that makes setting up web performance monitoring so easy. Well...there are a number of easy-to-install, pricey SaaS offerings, but those tend to be out of reach for the web performance enthusiast that wants to get started with RUM.

In this article, I want to introduce you to components of an inexpensive system to setting up RUM for a website. The set up is not for the faint of heart, but it is by far the easiest system I've put together for simple RUM. I will first discuss the components of the system, then dive into instructions for how you can set up such a system.

## General Setup

For our performance monitoring setup to work, we need four main components. Having each of these components perform an individual task makes the focus of each component very specific; however, it comes at the cost of maintaining separate systems. Fortunately, the method I'll discuss is not terribly frustrating.

**Component 1: Javascript Data Collection**

We are attempting to collect front end performance data. Without controlling the client connecting to the website, we are left to depend on JS APIs to collect data on the client side. The [Navigation Timing](https://developer.mozilla.org/en-US/docs/Navigation_timing) and [Resource Timing](http://www.w3.org/TR/resource-timing/) APIs, along with the clever timing of events on the client can all provide useful data about your site's performance. The first part of our monitoring involves uses these APIs and custom JS to collect the metrics we intend to track.

To this end, I use the wonderful [Boomerang](https://github.com/lognormal/boomerang) JS component for this purpose. Originally, developed by Yahoo, this library is currently maintained by [SOASTA](http://www.soasta.com/), a monitoring SaaS. As far as I can tell, the script is similar to what you would deploy on your site if you used SOASTA's service. It handles the hard work of normalizing data across browsers, surfacing useful metrics, and kicking off a beacon request so the data can be recorded. Boomerang has a plugin architecture that allows you to add more data to the beacon request. Additionally, the library comes with a number of plugins that exposes data that most people will already be interested in.

This component is only concerned with *taking measurements* and does not care about data format or storage. After taking its measurements, it passes the data to the next component in the system so it can be formatted and stored. As an example, Boomerang sends a request like the following on my website:

{% highlight bash %}
https://www.tollmanz.com/beacon?rt.start=navigation&rt.tstart=1435547327736&
rt.bstart=1435547328225&rt.end=1435547328345&t_resp=209&t_page=400&t_done=609&
t_other=t_domloaded%7C536&r=https%3A%2F%2Fwww.tollmanz.com%2Fhttp2-nghttp2-nginx-tls%2F&
r2=https%3A%2F%2Fwww.tollmanz.com%2F&nt_red_cnt=0&nt_nav_type=1&nt_nav_st=1435547327736&
nt_red_st=0&nt_red_end=0&nt_fet_st=1435547327736&nt_dns_st=1435547327755&
nt_dns_end=1435547327766&nt_con_st=1435547327766&nt_con_end=1435547327937&
nt_req_st=1435547327937&nt_res_st=1435547327945&nt_res_end=1435547327952&
nt_domloading=1435547327978&nt_domint=1435547328272&nt_domcontloaded_st=1435547328272&
nt_domcontloaded_end=1435547328272&nt_domcomp=1435547328344&nt_load_st=1435547328344&
nt_load_end=1435547328345&nt_unload_st=1435547327955&nt_unload_end=1435547327955&
nt_ssl_st=1435547327771&nt_spdy=1&nt_cinf=h2&
nt_first_paint=1435547328.33595&u=https%3A%2F%2Fwww.tollmanz.com%2Fhttp2-nghttp2-nginx-tls%2F
&v=0.9&vis.st=visible
{% endhighlight %}

To ravel that a bit, an easier to read version of the GET vars looks like:

{% highlight bash %}
rt.start:navigation
rt.tstart:1435547327736
rt.bstart:1435547328225
rt.end:1435547328345
t_resp:209
t_page:400
t_done:609
t_other:t_domloaded|536
r:https://www.tollmanz.com/http2-nghttp2-nginx-tls/
r2:https://www.tollmanz.com/
nt_red_cnt:0
nt_nav_type:1
nt_nav_st:1435547327736
nt_red_st:0
nt_red_end:0
nt_fet_st:1435547327736
nt_dns_st:1435547327755
nt_dns_end:1435547327766
nt_con_st:1435547327766
nt_con_end:1435547327937
nt_req_st:1435547327937
nt_res_st:1435547327945
nt_res_end:1435547327952
nt_domloading:1435547327978
nt_domint:1435547328272
nt_domcontloaded_st:1435547328272
nt_domcontloaded_end:1435547328272
nt_domcomp:1435547328344
nt_load_st:1435547328344
nt_load_end:1435547328345
nt_unload_st:1435547327955
nt_unload_end:1435547327955
nt_ssl_st:1435547327771
nt_spdy:1
nt_cinf:h2
nt_first_paint:1435547328.33595
u:https://www.tollmanz.com/http2-nghttp2-nginx-tls/
v:0.9
vis.st:visible
{% endhighlight %}

That request can be caught and handled with the second component in the system.

**Component 2: Middleware to Format and Route Beacon Data**

After Boomerang sends a beacon request, it must be handled by a server side component. At this point, we need to implement a middleware that takes the raw data collected by the client and converts it into a data that can be processed for storage. In this case, we want it to follow a common time-series data format that many storage engines are optimized to handle. The middleware needs to convert this data and pass it along for processing.

For this middleware, I use [Boomcatch](https://github.com/nature/boomcatch), which is a middleware that was built specifically for use with Boomerang. Boomerang is a [Node based server](http://cruft.io/posts/introducing-boomcatch/) that handles the Boomerang formatted data. You could write your own middleware, but the beauty of Boomcatch is that it will process all of the core Boomerang plugin data out of the box.

Boomcatch is highly customizable, but most importantly allows you to specify the following:

1. Validators: checks that will either allow a request to proceed or exit
1. Filters: remove unnecessary pieces of data
1. Mappers: converts data from one format to another
1. Forwarders: sends the mapped data to another service to be further processed

These four processes allow a developer to customize the data for the 3rd component's needs. Fortunately, all of the processes are automatically, handled via Boomcatch when using Boomerang and its plugins.

As an example of how Boomcatch handles data, the following reformatted log shows how a request is manipulated into more manageable data and it is passed to our 3rd component:

{% highlight bash %}
# Beacon request
2015-06-28 23:31:45 INFO boomcatch: referer=https://www.tollmanz.com/http2-nghttp2-nginx-tls/
user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko)
Chrome/43.0.2357.124 Safari/537.36 address=127.0.0.1[204.28.118.135] method=GET
url=/beacon?rt.start=navigation&rt.tstart=1435548704533&rt.bstart=1435548704935&
rt.end=1435548705016&t_resp=109&t_page=374&t_done=483&t_other=t_domloaded%7C431&
r=https%3A%2F%2Fwww.tollmanz.com%2Fhttp2-nghttp2-nginx-tls%2F&r2=https%3A%2F%2Fwww.tollmanz.com%2F&
nt_red_cnt=0&nt_nav_type=1&nt_nav_st=1435548704533&nt_red_st=0&nt_red_end=0&nt_fet_st=1435548704533&
nt_dns_st=1435548704557&nt_dns_end=1435548704614&nt_con_st=1435548704614&nt_con_end=1435548704629&
nt_req_st=1435548704633&nt_res_st=1435548704642&nt_res_end=1435548704650&nt_domloading=1435548704672&
nt_domint=1435548704965&nt_domcontloaded_st=1435548704965&nt_domcontloaded_end=1435548704965&
nt_domcomp=1435548705015&nt_load_st=1435548705015&nt_load_end=1435548705016&
nt_unload_st=1435548704655&nt_unload_end=1435548704655&nt_ssl_st=1435548704618&nt_spdy=1&
nt_cinf=h2&nt_first_paint=1435548704.912755&u=https%3A%2F%2Fwww.tollmanz.com%2Fhttp2-nghttp2-nginx-tls%2F&
v=0.9&vis.st=visible

# Reformatted data
2015-06-28 23:31:45 INFO boomcatch: sending
rt.firstbyte:109|ms
rt.lastbyte:483|ms
rt.load:483|ms
navtiming.dns:57|ms
navtiming.connect:15|ms
navtiming.response:8|ms
navtiming.dom:343|ms
navtiming.load:1|ms

# Confirmation of data being sent
2015-06-28 23:31:45 INFO boomcatch: sent 163 bytes
{% endhighlight %}

Notice the formatted data. For example, one piece of data that is passed on is the TCP connection time from the Navtiming API, `navtiming.connect:15|ms`. For this request, it took 15ms to establish the TCP connection. This data is formatted using the [StatsD Metrics Export Specification](https://github.com/b/statsd_spec). This spec was initially developed by Flickr and iterated on by Etsy and others. It is a format that storage engines like [Graphite](http://graphite.wikidot.com/) are built to handle.

After formatting this beacon data, it is passed on to our 3rd component for further processing.

**Component 3: Metrics Aggregator**

The 3rd component may be one of the harder ones to understand. This component listens for data sent to it via the 2nd component and pools this data for storage by the 4th component. This component stores data in memory for a fixed amount of time (e.g., 10 seconds), and sends the aggregated data along to the 4th component for storage. For instance, if 20 unique pieces of `navtiming.connect` data are sent to this component, it will take the average, median, min, max, and 95th percentile values and pass it along to the 4th component for storage. This is a simple way to reduce the overall amount of data stored, while also limiting the data writes to only 1 per specified time period. This allows developers to maintain a high level of data precision while maintaining the scalability of the monitoring system.

The most popular component to use for data aggregation is [StatsD](https://github.com/etsy/statsd). Developed by [Etsy](http://codeascraft.etsy.com/2011/02/15/measure-anything-measure-everything/), StatsD is a Node server that aggregates data and passes it along to a storage engine via UDP (recommended) or TCP to the 4th component, a storage engine. In this article, I will actually be talking about [DogstatsD](http://docs.datadoghq.com/guides/dogstatsd/), which implements the StatsD protocol and was developed for the [Datadog](https://www.datadoghq.com/) monitoring SaaS. It works just like StatsD, but has the advantaged of being installed along with the Datadog agent and preconfigured for the Datadog storage engine.

Once StatsD or DogstatsD aggregates a metrics, it sends it along to the 4th component that stores the aggregated data.

**Component 4: Metrics Storage Engine**

We've climbed mountains to format the data. Now, its time to store the fruits of our labor. A popular application for storing metrics data is [Graphite](http://graphite.wikidot.com/). Graphite allows you to store data within a scalable architecture and expose the data through a simple graphing interface. The little bit that I've experimented with Graphite has been positive; however, it has been a downright pain to get set up.

As an alternative to installing and managing Graphite, I will be discussing the [Datadog](https://www.datadoghq.com) SaaS in this article. Datadog is a hosted monitoring solution. After installing Datadog's software on your server, it'll start sending basic server information to the SaaS for you to view in highly configurable graphs and dashboards. Its API allows you to store pretty much any information you want. Even better, the service is free if you are ok with storing data for only 24 hours.

In an effort to make this walkthrough more manageable, we'll be using Datadog as the storage engine and monitoring solution. Once the data gets to Datadog, we have nothing left to do, but view the data.

**Bringing it Together**

Before moving on to installation information, let's stop to summarize what we've discussed so far. We have a 4 step process that begins by measuring data and ends with storing it using a SaaS. The data takes the following route:

1. Measured with Boomerang JS on the client and beaconed
1. Boomcatch consumes the beacon data, prepares and sends it to DogstatsD
1. DogstatsD aggregates 10 seconds worth of data and passes it along for storage
1. Datadog stores the data for viewing within their admin panel

Note that any of these 4 components can be exchanged for alternatives and in some cases, skipped completely. What I like about these components are that each one has a distinct purposes and is built without concern for any for other components in the system.

In this article, I am presenting the tools I am using as a simple and dirt cheap way to get started with monitoring. The implementation I will discuss is not built for high traffic, high availability monitoring; rather, it focuses on a reasonably approachable and affordable solution for those without big budgets who want to begin with RUM. Most certainly, this set up can be enhanced to handle a more robust load, but this article will not discuss those details.

## Installing Boomerang

Setting up Boomerang is a convoluted process of adding JS to your website. It basically comes down to adding a script to your site, but the documentation will drive you nuts trying to figure out exactly how to put it all together. Hopefully I can help clarify some of the pain points.

For Boomerang to work, you must include the [main Boomerang script](https://github.com/lognormal/boomerang/blob/master/boomerang.js), as well as at least one [plugin](https://github.com/lognormal/boomerang/blob/master/plugins) and configure the Boomerang with at least a the `beacon_url` option. Boomerang has 15 plugins available and you can write additional plugins as you see fit. To get started, you need to pick at least one plugin. I initially chose the [navtiming.js](https://github.com/lognormal/boomerang/blob/master/plugins/navtiming.js) and [rt.js](https://github.com/lognormal/boomerang/blob/master/plugins/rt.js) plugins, which collect metrics from the W3C Navigation Timing API and round trip time, respectively. I also chose to send the beacon requests simply to `/beacon`. I downloaded all of my chosen scripts and added the following to the footer of my site:

{% highlight html %}
<script src="/js/boomerang.js"></script>
<script src="/js/rt.js"></script>
<script src="/js/navtiming.js"></script>
<script>
  BOOMR.init({
    beacon_url: "/beacon"
  });
</script>
{% endhighlight %}

With this minimal setup, I could see that the measurement and beaconing was working by viewing the network tab in Chrome. It showed that a request to `/beacon` with a number of `GET` variables was indeed issued. Without having set up the `/beacon` endpoint, this request 404'ed. Viewing the request, I could see that the following data was sent:

{% highlight bash %}
rt.start:navigation
rt.tstart:1435637445043
rt.bstart:1435637445344
rt.end:1435637445418
t_resp:38
t_page:337
t_done:375
t_other:t_domloaded|321
r:http://127.0.0.1:4000/
nt_red_cnt:0
nt_nav_type:0
nt_nav_st:1435637445043
nt_red_st:0
nt_red_end:0
nt_fet_st:1435637445043
nt_dns_st:1435637445043
nt_dns_end:1435637445043
nt_con_st:1435637445043
nt_con_end:1435637445043
nt_req_st:1435637445069
nt_res_st:1435637445081
nt_res_end:1435637445084
nt_domloading:1435637445111
nt_domint:1435637445364
nt_domcontloaded_st:1435637445364
nt_domcontloaded_end:1435637445364
nt_domcomp:1435637445416
nt_load_st:1435637445416
nt_load_end:1435637445417
nt_unload_st:1435637445096
nt_unload_end:1435637445096
nt_spdy:0
nt_cinf:http/1
nt_first_paint:0
u:http://127.0.0.1:4000/monitoring/
v:0.9
vis.st:visible
{% endhighlight %}

Clearly things are working! If you are following along, I'd recommend experimenting with additional plugins at this time to see the data that it will produce. All you need to do is add the `script` tag for the plugin that you wish to try and view the resulting data to see if it fits your needs.

If you read the documentation for Boomerang, it will suggest that you use an async loading mechanism for the scripts. In my experience, I completely agree. Just adding this monitoring to my site cost me about 500ms in start render time. Given that my start render was at about 700ms, this was not acceptable. I used their recommended iframe loading technique as a result.

The documentation will suggest that you use an included `make` command to build a single concatenated and minified script to async load; however, in my experience, this `make` command was badly broken. It seemed to include plugins I did not want, as well as exclude ones I did want. As such, I recommend skipping the `make` command. Instead, manually add boomerang.js, the desired plugins, and the call to `BOOMR.init` in a file. Be sure to minify it after concatenating these files. Name it with a version number to make it easy to purge from caches if you ever update it.

Once you have the single file prepared, add the following code to the footer of your site, being sure to update the path to the concatenated and minified file:

{% highlight html %}
<script>
(function(){
  var dom,doc,where,iframe = document.createElement('iframe');
  iframe.src = "javascript:false";
  (iframe.frameElement || iframe).style.cssText = "width: 0; height: 0; border: 0";
  var where = document.getElementsByTagName('script')[0];
  where.parentNode.insertBefore(iframe, where);

  try {
    doc = iframe.contentWindow.document;
  } catch(e) {
    dom = document.domain;
    iframe.src="javascript:var d=document.open();d.domain='"+dom+"';void(0);";
    doc = iframe.contentWindow.document;
  }
  doc.open()._l = function() {
    var js = this.createElement("script");
    if(dom) this.domain = dom;
    js.id = "js-iframe-async";
    js.src = '/js/boomerang-1.js'; # Update me!!!
    this.body.appendChild(js);
  };
  doc.write('<body onload="document._l();">');
  doc.close();
})();
</script>
{% endhighlight %}

With this async loading method in place, I was able to see a start render and visually complete time closer to that of my "pre-monitoring" scores. The async loading methods helps to avoid the observer effect wherein the process of measuring causes a change to the phenomena you are measuring.

## Installing Boomcatch

## Installing Datadog

## Setting up Dashboards
