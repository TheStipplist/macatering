require(["dojo/router","dojo/request","dojo/on","dojo/dom","dojo/dom-attr","dojo/dom-construct","dojo/domReady!"], macatering);
function macatering(router, request, on, dom,domAttr, domConstruct){
    function macateringRouter(event){
        // when a link is clicked it registers an event to get the clicked links href and push it to the current hash
        if(event){
            event.preventDefault();
            var theLink = domAttr.get(this, "href");
            console.log(theLink)
            router.go(theLink);
            
        }
        //registers single param url's, fires function to retrieve json for the 'view' template
        router.register(':view',getJSON);

        //registers double param urls, fires function to retrieve json for the 'view' and 'menu' template
        router.register(':view/:menu',getJSON);

        //starts up the router and watches for registered routes 
        router.startup();

        //when the website is loaded and an empty route appears
        if(location.hash === ""){
            //changes the hash to home for the homepage
            router.go('home');
        }
    }

    //function to retrieve JSON files
    function getJSON(evt){
        console.log(evt.params.view, evt.params);

        //every route has a 'view' template to be constructed, named for the declared url param. First we need the json file for its data to fill the constructed page's content
        //we use the hashchange event's params object to construct the pathname to the  json file and then fire the callback function
        request.get("/scripts/JSON/"+ evt.params.view +".json",{handleAs:"json"}).then(buildView);

        //if it is one of the secondary links clicked it has a 'menu' param
        if(evt.params.menu){request.get("/scripts/JSON/"+ evt.params.view + "/" + evt.params.menu + ".json",{handleAs:"json"}).then(buildMenu);}
        
        //log statement to let me know it's done constructing content
        console.log('done with constructing page');

        function buildView(response){
            console.log('started building view');

            //empties the area we are going to load the new page inside
            domConstruct.empty("build-stage");

            domConstruct.create("div", {id: "view", class:"clearfix"},"build-stage");
            domConstruct.create("div", {id: "content", class:"clearfix"},"view");
            domConstruct.create("h1",{class: "heading",innerHTML: response.heading}, "content");
            if(response.header){
                domConstruct.create("div",{id: "header",class: "clearfix", innerHTML: response.header},"content");
            }
            if(response.content.heading){
                domConstruct.create("h1", {class: response.content.type + " heading", innerHTML: response.content.heading},"content")
            }
            domConstruct.create(response.content.tag,{id: response.content.type}, "content");
            
            response.content.children.item.forEach(function(item){
                domConstruct.create(response.content.children.tag, {class: "item", innerHTML: item},response.content.type);
            });
            if(response.button){
                domConstruct.create("button", {class: "button",href: response.button.link, innerHTML: response.button.text},"content");
            }
            if(response.signature){
                    dom.byId("content").innerHTML += response.signature;
            }

        }
        function buildMenu(response){
            console.log("started building menu");

            //cake of the month's content has a totally different structure than 'view' or 'menu' and it needs it's own function' 
            if(evt.params.view === "cakeOfTheMonth"){
                cakeOfTheMonth();
                return
            }
            
            //constructing the dom elements for the menu
            domConstruct.create("div",{id:"menu", class:"clearfix"}, "build-stage");
            domConstruct.create("h1",{class: "heading", innerHTML: evt.params.menu},"menu");
            domConstruct.create("img",{class: "menu-image", src: "images/menu/" + evt.params.view +"/"+ evt.params.menu + ".jpg"}, "menu");
            domConstruct.create("ul",{id:"list"}, "menu");

            response.list.item.forEach(function(item){domConstruct.create("li",{class:"item", innerHTML:item}, "list");});

            function cakeOfTheMonth(){
                //dojo domConstruct functions; 1st parameter: type of html element to be created, 
                //2nd parameter: object of attributes to be given to html element, 3rd parameter: the id of the html element to place this new element inside 
                domConstruct.create("div", {id: "CakeOfTheMonth", class:"clearfix"},"build-stage");
                domConstruct.create("div",{id: "cake-content",class:"clearfix"},"CakeOfTheMonth");
                domConstruct.create("h1",{class: "heading",innerHTML: "January"}, "cake-content");
                domConstruct.create("h1",{id: "cake-name",innerHTML: response.January.cake}, "cake-content");
                domConstruct.create("div",{id: "header",class:"clearfix"}, "content");
                domConstruct.create("p",{id: "cake-description", class: "scrollbar style-2", innerHTML: response.January.description}, "header")
                domConstruct.create('img',{id:"cake-image", class: "image", src:response.January.image},"header");
                domConstruct.create('table',{id: "months", innerHTML:response.table},"content");

                

            }
        }
    }
    
    

    //declares variable to hold parent element to navbar anchor tags
    var navLinks = dom.byId("selections");

    //adds event listener to navbar links that on click start the router
    on(navLinks, "a:click", macateringRouter);
    
    $('#months td').on('click',function(event){
        var newMonth=this.innerHTML;
        $('#cake-name').innerHTML = response[newMonth].cake;
        $('#cake-description').innerHTML = response[newMonth].description;
        $('#cake-image').src = "images/CakeOfTheMonth/" + response[newMonth].image + ".jpg";
    });
    macateringRouter();
}

//one of my biggest issues is that the function that will load the cake of the month page 
//will not get called even though im positive the url hash' params match the required 
//path to the cakes.json file


// also some odd behavoir; line 34 calls buildView and line 37 calls buidMenu
// apparently that occurs after the log statement in line 40 which i feel is weird and maybe has something
// to do with my problem
