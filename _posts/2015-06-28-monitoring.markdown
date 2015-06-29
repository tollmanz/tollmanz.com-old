---
layout:     post
title:      "An Almost Free, DIY Solution for Monitoring Performance Data"
date:       2015-06-28 23:00:00
categories: monitoring, performance
---

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
