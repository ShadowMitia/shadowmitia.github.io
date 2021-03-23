#!/usr/bin/python
# -*- coding: utf-8 -*-

from os import walk
import json
import toml
import re
import mmap

from PIL import Image
import PIL

dirs = []
for (dirpath, dirnames, filenames) in walk("public/"):
    dirs.extend(dirnames)
    break

projects = []

sep_search = re.compile(b"(====*)")

for directory in dirs:
    print(f"Processing {directory}")
    project = {}
    for (dirpath, dirnames, filenames) in walk(f"public/{directory}"):

        if "album" in dirpath:
            project["album"] = filenames
            continue

        project["slug"] = directory
        files = filter(lambda f: "index.md" in f, filenames)
        for file in files:
            project["file"] = file
        if not ("file" in project):
            print(f"Skipping {directory} : no 'index.md'")
            break

        with open(f"public/{project['slug']}/{project['file']}", "r+") as f:
            data = mmap.mmap(f.fileno(), 0)
            pos = re.search(sep_search, data)

            if pos is None:
                print(f"Skipping {directory} : no TOML header")
                break
            toml_data = toml.loads(f.read(pos.start() - 1))
            # We arrived, we dump all the data found in toml in the dict
            project = {**project, **toml_data}
            project["offset"] = pos.end() + 1

        files = filter(lambda f: "featured" in f, filenames)
        for file in files:
            project["featured_image"] = file

    if not ("featured_image" in project):
        print(f"Warning : no featured_image")

    if not ("published" in project) or project["published"] == False:
        print(f"Skipping {directory} : not published")
        continue

    if not ("published_date" in project):
        print(f"Skipping {directory} : no valid publication date")
        continue
    projects.append(project)


print("Converting images to WebP")
# TODO: multithread this
# Change all images to WebP
for project in projects:
    slug = project["slug"]
    if "featured_image" in project:
        img = project["featured_image"]
        image = Image.open(f"public/{slug}/{img}")
        image = image.convert('RGB')
        filename = img.split(".")[0] + ".webp"
        image.save(f"public/{slug}/{filename}", format = "WebP")
        project["featured_image"] = filename

    if "album" in project:
        new_album = []
        for image in project["album"]:
            if not image.endswith((".jpg", ".png")):
                continue
            img = image
            image = Image.open(f"public/{slug}/album/{img}")
            image = image.convert('RGB')
            filename = img.split(".")[0] + ".webp"
            image.save(f"public/{slug}/album/{filename}", format = "WebP")
            new_album.append(filename)
        project["album"] = new_album

data = {
    "projects": projects
}

with open("public/data.json", "w", encoding='utf8') as write_file:
    json.dump(data, write_file, ensure_ascii=False)


