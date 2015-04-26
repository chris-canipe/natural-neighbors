# Natural Neighbors

An experiment to map out natural neighborhoods.

Areas that this can encompass include:

1. National:
  1. Parks
  1. Monuments
  1. Forests
  1. Wildlife refuges
  1. Historic sites
  1. Seashores
  1. Lakeshores
  1. Grasslands
  1. Wildernesses
1. State
  1. Parks
  1. Wildlife areas

# Execution

1. `git clone` this project.
1. `cd` to the project.
1. Start a local web server, e.g., `ruby -run -e httpd . -p 8888`.
1. Load `localhost:8888` into your browser (preferably Chrome).

# Data

Gathering data has been a challenge. The approach I've worked out so
far is:

1. Open `Google Earth`.
1. Reduce noise by disabling all layers except `Parks/Recreation
   Areas`, et al.
1. Right-click a landmark and choose `Save to My Places`.
1. Organize saved places into folders, e.g., `State Parks`, `National
   Parks`, etc.
1. Right-click a folder and choose `Save Place As...`.
1. Save the places as a `KML` file.
1. Use [Ogre](http://ogre.adc4gis.com) to convert the `KML` to
   `geojson`.
1. Tidy the JSON via [JSON Pretty Print](http://jsonprettyprint.com).
1. Add the file to the project.

# Credits

The idea took root after seeing [this image](http://i.imgur.com/N33uY3a.jpg) and the code for the project sprung from [this example](http://bl.ocks.org/shimizu/5610671).
