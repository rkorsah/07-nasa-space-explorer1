# APOD Explorer

A responsive gallery for NASA's Astronomy Picture of the Day (APOD). The page
loads nine consecutive days of APOD entries, shows a random space fact, and
opens each entry in a detail dialog with its full-size image or video link,
title, date, and explanation.

## Run the project

Open `index.html` in a modern browser while connected to the internet. Select
a date range and choose **Get Space Images** to fetch data from NASA's public
APOD API. The page uses `DEMO_KEY` by default. For higher API limits, request
a key at [api.nasa.gov](https://api.nasa.gov/) and enter it in the NASA API
key field. The key is sent to NASA with the API request and is not saved by
this page.

Students, teachers, or classrooms can enter a name for a personalized welcome.
The name stays in the page and is not sent to NASA.

Choose nine consecutive dates, with the end date exactly eight days after the
start date. APOD dates begin June 16, 1995, and cannot be later than today.
APOD video entries are marked in the gallery and include a link to watch the
video in the detail dialog.

## Reflections

### Working with APIs

The APOD API made it possible to build a changing gallery without maintaining
an image collection in the project. The date range and API key are sent as
query parameters, and the page checks the response before displaying the
gallery. A key lesson is that API responses can contain different media types,
so image and video entries need separate display behavior.

### Debugging

The date range is validated before the request because the gallery needs nine
consecutive entries. The loading message stays visible until the request
finishes, and API or network errors are shown on the page rather than leaving
an empty gallery without an explanation. Checking the browser's network tab
and the API response is useful when a request fails or returns an unexpected
number of entries.

### LinkedIn post draft

I built APOD Explorer, a responsive NASA Astronomy Picture of the Day gallery.
It fetches nine days of astronomy images and videos, includes a detail view
with explanations, and adds a daily random space fact. This project helped me
practice working with an API, handling loading and error states, and making
interactive content accessible across screen sizes.
