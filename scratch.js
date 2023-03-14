import dip from 'dumpster-dip'

const wiki = `../masters/data/raw/wikipedia/en/enwiki-latest-pages-articles.xml`

const opts = {
  input: wiki,
  // directory for all our new files
  outputDir: './results', // (default)
  // how we should write the results
  outputMode: 'ndjson', // (default)
  // which wikipedia namespaces to handle (null will do all)
  namespace: 0, //(default article namespace)
  // define how many concurrent workers to run
  heartbeat: 5000, //every 5 seconds

  // what do return, for every page
  parse: function (doc) {
    page = {
        "title": doc.title(),
	"pageID": doc.pageID(),
	"sections": []
    }
    for (let section of doc.sections()) {
	section_title = section.title();
	section_depth = section.depth();

	current_section = {
	    "title": section_title,
	    "depth": section_depth,
	    "sentences": []
	}

	for (let sentence of section.sentences()) { 
	    let sentence_json = sentence.json();

	    let links = []
	    if (sentence_json.links !== undefined) {
		for (let link of sentence_json.links) {
		    if (link.type === "internal") {
			links.push({
			    "text": link.text,
		            "title": link.page
			})
		    }
		}
	    }


	    current_section.sentences.push({
                "text": sentence_json["text"],
                "links": links,
	    });
	}
	
	if (current_section["sentences"].length > 0) {
	    page.sections.push(current_section);
	}
    }

    if (page.sections.length == 0) {
        return null;
    }

    return page;
  },
}

dip(opts).then(() => {
  console.log('done')
})
