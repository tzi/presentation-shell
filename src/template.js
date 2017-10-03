const fs = require('fs');
const Handlebars = require('handlebars');
require('handlebars-helpers')({
    handlebars: Handlebars
});

function templateCreator(templateFile) {
    let template;
    let html;

    function initialize() {
        const templateString = fs.readFileSync(templateFile, 'utf8');
        template = Handlebars.compile(templateString);
    }

    function compile(data) {
        html = template(data);

        return this;
    }

    function toHTML(fileName) {
        fs.writeFile(fileName, html, error => {
            if (error) {
                console.error(error)
            }
        });

        return this;
    }

    function clean(fileName) {
        fs.unlinkSync(fileName);

        return this;
    }

    initialize();

    return {compile, toHTML, clean};
}

module.exports = templateCreator;