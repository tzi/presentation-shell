#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const marked = require('marked');
const cheerio = require('cheerio');
const template = require('./template');

function presentationCreator(templateFileName) {
    const headerSelector = 'h1, h2, h3, h4, h5, h6';

    function getSlideParameters($, $cursor, page) {
        const title = $cursor.text().trim();
        const type = $cursor.get(0).tagName.slice(1);
        const content = $cursor.nextUntil(headerSelector).toArray().map(element => $.html(element)).join("\n");

        return {title, content, type, page};
    }

    function getParameters(fileName) {
        const html = marked(fs.readFileSync(fileName, 'utf8'));
        const $ = cheerio.load(html);
        let $cursor = $('h1').first();
        const title = $cursor.text().trim();
        const name = path.basename(fileName).slice(0, -path.extname(fileName).length);
        const slides = [];

        $cursor = $(headerSelector).first();
        let slide = {};
        let titleCount = 1;
        while ($cursor.length) {
            slide = getSlideParameters($, $cursor, slides.length + 1);
            if (slides.length > 0) {
                if (['−', '-'].includes(slide.title)) {
                    slide.title = slides[slides.length - 1].title;
                }
                if (slide.title === slides[slides.length - 1].title) {
                    titleCount++;
                    slide.titleCount = titleCount;
                } else {
                    titleCount = 1
                }
            }
            slides.push(slide);
            $cursor = $cursor.nextAll(headerSelector).first();
        }

        return {title, name, slides};
    }

    function compile(dataFileName) {
        const data = getParameters(dataFileName);
        const compiled = template(templateFileName)
            .compile(data);

        return {
            toHTML: function(targetFolder) {
                compiled.toHTML(targetFolder + '/' + data.name + '.html');
            }
        }
    }

    return {
        compile
    }
}

module.exports = presentationCreator;