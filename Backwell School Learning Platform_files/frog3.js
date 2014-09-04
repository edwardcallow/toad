var debug = false;
var temp;
var helper_width = $.browser.msie ? {"width": "200px"} : {"width":"auto", "min-width":"200px"};

function add_stylesheet(url, targetDocument) {	
	var alreadyIncluded = false;
	$("link", targetDocument).each(function() {
		if(this.href.indexOf(url) >= 0) {
			alreadyIncluded = true;
		}
	});
	
	if(!alreadyIncluded) {
		if(targetDocument.createStyleSheet) {
			targetDocument.createStyleSheet(url);
		} else {
			$("head:first", targetDocument).append('<link rel="stylesheet" type="text/css" href="'+escape(url)+'">');
		}
	}
}

function get_params(the_item, html_element) {
	var el = $(html_element);
	var it = $(the_item);

	if($.browser.msie) {
		if(el.children().find("object").length && el.children().find("div[id^='CHART_']").length) {
			el.children().find("object").remove();

			if(it.data("names")) {
				var names = it.data("names").split("|");
				var values = it.data("values").split("|");

				var passed_params = [];

				var i = names.length - 1;
				while(i--) {
					passed_params[names[i]] = values[i];
				}

				var n = el.children().find("div[id^='CHART_']");

				n.flash({
					swf: values[0],
					width: it.data("width"),
					height: it.data("height"),
					params: passed_params
				});
			}
		}
	}
}

/* DRAGS */
scroll_element = $.browser.msie ? "div.ie_container" : document;
scroll_speed = $.browser.msie ? 10 : 30;

function setup_drags() { // super function, called on start - makes anything that should be draggable, erm, draggable
	$("a.draggable_page, div.editmode").each(function() {
		setup_individual_drag(this, $(this).hasClass("draggable_page"));
	});
}

function setup_individual_drag(the_item, from_top) { // deals with all the things you have to think about when dragging things about
	var it = $(the_item);
	var h = 0;

	it.draggable({
		appendTo: "body",
		cursor: "move",
		zIndex: 200000,
		revert: "invalid",
		opacity: 0.85,
		cursorAt: { top: 0, left: 0 },
		refreshPositions: true,
		scroll: true,
		scrollSpeed: scroll_speed,
		scrollSensitivity: 75,
		scrollElement: scroll_element,
		helper: function(e) {
			if($("div#helper").length == 0) {
				$("body").append("<div id='helper'></div>");
			}

			var helper_div = $("div#helper");
            helper_div.css(helper_width);
            
			if(from_top) {
				if(!e.target.id) {
					e.target.id = e.target.parentNode.id;
				}
                
                if(e.target.id.match(/838:/)) {
                    helper_div.html('<img src="/wp/icons/fdp.png" alt="FDP WIDGET" />').attr("fdp", "true");
                } else {
                    helper_div.load("/myfrogtrade/frog3_getpage.phtml?t=" + (+new Date) + "&strip_scripts=1&type=" + e.target.id.replace(/745:/, ""), "", function() {
                        $("a.edit_link", helper_div).hide();
                        $("a.edit_link", helper_div).parent().hide();

                        // FUSION CHARTS HANDLING FOR IE
                        if((helper_div.children().find("div[id^='CHART_']").length > 0) && $.browser.msie) {
                            it.data("names", "");
                            it.data("values", "");

                            helper_div.children().find("object").children("param").each(function() {
                                it.data("names", it.data("names") + $(this).attr("name") + "|");
                                it.data("values", it.data("values") + $(this).attr("value") + "|");
                            });

                            it.data("width", it.children().find("object").attr("width"));
                            it.data("height", it.children().find("object").attr("height"));
                        }
                    });
                }
            } else {
				helper_div.html(it.html());

				if(it.children().find("object").length) { // if we gots the flash fever, we needs to take out the nested_page wrapper.  Otherwise, it breaks
					if((it.children().find("div[id^='CHART_']").length > 0) && $.browser.msie) {
						it.data("names", "");
						it.data("values", "");

						it.children().find("object").children("param").each(function() {
							it.data("names", it.data("names") + $(this).attr("name") + "|");
							it.data("values", it.data("values") + $(this).attr("value") + "|");
						});

						it.data("width", it.children().find("object").attr("width"));
						it.data("height", it.children().find("object").attr("height"));

						helper_div.children().find("object").remove();

						var names = it.data("names").split("|");
						var values = it.data("values").split("|");

						var passed_params = [];

						var i = names.length - 1;
						while(i--) {
							passed_params[names[i]] = values[i];
						}

						var n = helper_div.children().find("div[id^='CHART_']");

						n.flash( {
							swf: values[0],
							width: it.data("width"),
							height: it.data("height"),
							params: passed_params
						});
					}
				}
			}

			return helper_div;
		},
		start: function(e, ui) {
			window.dropped = false;
			$("div.frog3 > div.nested_page").unbind("mouseover").unbind("mouseout");

			// turn off any nested drop areas
			$("div#helper").children().find(".ui-droppable").removeClass("ui-droppable");

			if(!from_top) {
				temp = it.html();
				it.css("display", "none").html("");
				var parent_area = it.closest(".frog3");
				resize_area(parent_area);
			}

			h = ui.helper.height();
		},
		stop: function(e, ui)
		{
			it.removeClass("editmode_hover");
			if(!from_top)
			{
				if(!window.dropped) // have we missed a droppable?
				{
					if(temp)
					{
						it.html(temp);
					}
					get_params(the_item, the_item);
					$("div.temp").remove();
					it.css("display", "block");
					setup_configs();
					setup_drags();
					$('div.frog3', the_item).each(function()
					{
						setup_individual_drop(this);
					});
				}
			}
			window.currentDroppable = null;
		},
		drag: function(e, ui) {            
			if(!window.currentDroppable) {
				if($("div.highlight").length) {
					window.currentDroppable = $("div.highlight:first");
				}
			} else {
				var aa = $(window.currentDroppable);
				var l = window.existing.length;
				var before = null;

				var draggedTop = ui.position.top;
				var areaTop = aa.offset().top;
				var overallTop = draggedTop - areaTop;

				for(i = 0; i < l; i++) {
					if(overallTop < window.existing[i]) {
						before = i;
						i = l; // break loop
					}
				}

				if((before !== null && before !== window.place_under) || (before === null && window.place_under !== l)) {
					$("div.temp").remove();

					var temp_div = document.createElement('div');
					temp_div.className = 'temp';
					temp_div.innerHTML = ui.helper.html();

					if(before !== null) {
						// var child_targets = window.areaType === "folder_tab" ? "div.nested_page, div.brick" : "div.nested_page";
                        var child_targets = "div.nested_page, div.brick";
						aa.children(child_targets).eq(before).before(temp_div);
						window.place_under = before;
					} else {
						aa.append(temp_div);
						window.place_under = l;
					}
				}
			}
		}
	});
}

function stop_drags() // stop anything that was draggable from being so
{
	$(".editmode").draggable("destroy").removeClass("editmode");
}

/* DROPS */
function setup_drops() // sets up all the areas where you can put things into, off by default
{
	$("div.frog3").each(function()
	{
		setup_individual_drop(this);
	}).droppable("disable");
}

function setup_individual_drop(active_area) // each individual drop area's configuration
{
	resize_area(active_area);
	var aa = $(active_area);

	if(aa.children("div.temporary_spacer").length == 0)
	{
		aa.prepend("<div class='temporary_spacer'><span>TEMP SPACER</span></div>");
	}
	aa.addClass("editmode_nested_page_active_area");
	aa.droppable( {
		accept: ".draggable_page, .nested_page, .s_uwa_container",
		greedy: "true", // nests don't work if this is false.  jQuery one line fix FTW!
		tolerance: "pointer",
		hoverClass: "highlight",
		drop: function(ev, ui) {
			var areaType = window.areaType;
			var placeUnder = window.place_under;
			var tempDiv = $("div.temp:first", aa);
			var helper = ui.helper;
			var draggable = ui.draggable;
            
            helper.remove();
			window.onbeforeunload = confirm_leave; // things have changed: so make sure someone wants to leave the page

			var from = 0, to = 0, dropped_page_id = 0, frame_id = 0, sequence = 0, parent_nest = 0, the_content = false;

			if(aa.parents("div.widget").length)
			{
				parent_nest = aa.closest("div.widget");
			}
			else
			{
				parent_nest = areaType === "folder_tab" ? aa.closest("div.s_folder_tabs") : aa.closest("div.nested_page");
                // If parent_nest is empty, then is this a Widget Placeholder brick?
                if (parent_nest.length == 0) parent_nest = aa.closest("div.s_widget_area");
			}

			parent_nest = parent_nest.attr("id").replace(/np_/, "");
            
            if(!draggable.hasClass("draggable_page")) // we're moving, so we need to know where from
			{
				from = draggable.attr("id").replace(/np_/, "");
                var dp;
                
                if(helper.find("div.s_widget_area").length) {
                    dp = helper.find("div.s_widget_area:first > div.ajax_qe:first");
                } else {
                    dp = helper.find(".ajax_qe:first");
                }
                
                dropped_page_id = dp.length ? dp.attr("id").replace(/ajax_qe_/, "").replace(/_1/, "") : 0;
			}
			else // new, so we need to know of what type it is
			{
				var id_parts = draggable.attr("id").split(":");
				frame_id = id_parts[0];
				dropped_page_id = id_parts[1];
			}

			tempDiv.children().wrapAll("<div class='nested_page'></div>");
			var np_child = tempDiv.children('div.nested_page:first');
			if(np_child.length == 1)
			{
				the_content = np_child;
			}
            
			if(helper.html()) {
                if(helper.attr("fdp")) {
                    the_content = '<div type="FDP Widget Container" class="brick s_uwa_container editmode"><img src="/wp/icons/fdp.png" alt="FDP WIDGET" style="margin:15px auto; display:block; text-align:center;"/></div>';
                }
				tempDiv.replaceWith(the_content);
			}

			if($("span.script_removed", the_content).length > 0) {
				if(!$(document).data("refresh_afterwards")) { // refresh, if it's not in an iframe
					$(document).data("refresh_afterwards", !aa.parents("div.scrollframe_replacement:first").length);
				}
			}

			if(placeUnder !== null) { // we already have something to place it under, so it follows that we must know the page id's sequence we are inserting into
				//var targetSelector = (areaType === "folder_tab") ? "> div.brick, > div.nested_page" : "> div.editmode";
				var targetSelector = 1 ? "> div.brick, > div.nested_page" : "> div.editmode";
				var target = $(targetSelector, aa)[(placeUnder - 1)];
				
				if(target) {
					var existing = $(target).attr("id").replace(/np_/, "");
					var existing_parts = existing.split("-");
					to = existing_parts[0] + "-" + (parseInt(existing_parts[1]) + 1);
				}
			}

			var element_to_use = (areaType === "folder_tab") ? "div.s_folder_tabs:first" : "div.nested_page:first";
			var area_class = (areaType === "folder_tab") ? "div.inner" : "div.nested_page_area";
			var container = aa.parents(element_to_use);
			var sibling_areas = [];

			$(container).find(area_class).each(function()
			{
				if($(this).parents(element_to_use).attr("id") == $(container).attr("id"))
				{
					sibling_areas.push(this);
				}
			});

			var blank_area_index = $(sibling_areas).index(aa);

			if(blank_area_index == -1)
			{
				blank_area_index = 0;
				if(!to)
				{
					if(!sequence)
					{
						sequence = 1;
					}
				
					if(areaType !== "folder_tab")
					{
                        if ($(".edit_link:first", active_area).parent().length) {
						to = $(".edit_link:first", active_area).parent().attr("id").replace(/edit_link_/, "").replace(/_1/, "") + "-" + sequence;
                        } else {
                            to = 0;
					}
				}
			}
			}

			if(!sequence)
			{
				if(!to)
				{
					sequence = 1;
				}
				else
				{
					sequence = to.replace(/(\d+)[-]/, '');
				}
			}

			if(!the_content && (frame_id == 745 || frame_id==0) ) // if we have been so quick that the temporary div has not finished drawing, put the item in now
			{
                if(draggable.hasClass("draggable_page")) {
                    if(tempDiv.length == 0) // we may not even have a temporary div - so put one in so that it can be replaced
                    {
                        if(sequence > 1)
                        {
                            if((sequence - 1) != $("> .editmode", aa).length)
                            {
                                $("> .editmode", aa).eq(sequence - 1).before("<div class='temp'></div>");
                            }
                            else
                            {
                                aa.append("<div class='temp'></div>");
                            }
                        }
                        else
                        {
                            aa.children("div.temporary_spacer").after("<div class='temp'></div>");
                        }
                    }

                    tempDiv = $("div.temp", aa);
                    tempDiv.removeClass("temp").html("<div style='background-color: black; background-image: url(/sysimages/frog3/progress.gif); background-position: 50% 50%; background-repeat: no-repeat; width: 100%; height: 100px; -ms-filter:\"progid:DXImageTransform.Microsoft.Alpha(Opacity=80)\"; filter: alpha(opacity=80); opacity: 0.8;'></div>");
                    insert_content(dropped_page_id, tempDiv);

                    var t = setInterval(function()
                    {
                        if(window.inserted)
                        {
                            tempDiv.removeClass("temp");
                            the_content = tempDiv;
                            the_content.addClass("nested_page").addClass("widget");
                            setup_configs();
                            setup_drags();
                            activate_areas(the_content);						
                            if(window.document_id)
                            {
                                reassign_ids(active_area, "np_" + document_id);
                                the_content.fadeOut(100).fadeIn(300);
                                if($("span.script_removed", the_content).length > 0)
                                {
                                    if(!$(document).data("refresh_afterwards")) { // refresh, if it's not in an iframe
                                        $(document).data("refresh_afterwards", !aa.parents("div.scrollframe_replacement:first").length);
                                    }
                                }
                            }

                            clearInterval(t);
                        }
                    }, 100);
                } else {
                    window.dropped = false; // no preview, just act as though we've missed a drop area
                    return;
                }
			}

			window.document_id = 0;

			if(debug)
			{
				alert(["from:", from, "to:", to, "sequence:", sequence, "parent_nest:", parent_nest, "blank_area_index:", blank_area_index, "dropped_page_id:", dropped_page_id, "frame_id:", frame_id]);
			}
			$.post("/myfrogtrade/frog3_savenestedpage.phtml", {"from":from, "to":to, "sequence":sequence, "parent_nest":parent_nest, "blank_area_index":blank_area_index, "dropped_page_id":dropped_page_id, "frame_id":frame_id}, function(responseText)
			{
				if(debug) alert(responseText);
				$("input, textarea, button", the_content).attr("disabled", true);

				if(responseText.indexOf("true") >= 0 && responseText.indexOf("false") == -1)
				{
					var content = $(the_content);
					var wait_until_done = false;
					var document_id = responseText.substring(6, responseText.indexOf("-"));
					window.document_id = document_id;

					if(!draggable.hasClass("draggable_page")) // remove the original element if we're moving
					{
						var original_parent = draggable.closest(".frog3");
						draggable.remove();

						reassign_ids(original_parent, null);
					}

					reassign_ids(active_area, "np_" + document_id);
					if(frame_id == 745) { content.addClass("widget").addClass("nested_page"); }
                    
					var t = setInterval(function()
					{
						if(!wait_until_done)
						{
							// if it has any nested pages within an area that are editable by the user, make them editable
							var first_iframe = content.find("iframe:first");
							if(first_iframe)
							{
								if(first_iframe.hasClass("frog3_enabled") && !first_iframe.parent().hasClass('ajax_qe'))
								{
									first_iframe.parent().addClass("frog3");
								}
							}

							if(draggable.hasClass("draggable_page"))
							{
								activate_areas(content);
							}

							destroy_drops();
							setup_editor();

							if(the_content)
							{
								content.fadeOut(100).fadeIn(300);
							}

							$(".editmode_hover").removeClass("editmode_hover");
							clearTimeout(t);
						}
					}, 100);
				}
			});
			$("body").css("cursor", "auto");
			window.dropped = true;
		},
		over: function(ev, ui) {
			resize_area(aa);
			window.currentDroppable = aa;
			window.areaType = aa.is("div.inner") ? "folder_tab" : "active_area";

			window.existing = [];

			aa.children("div.nested_page, div.brick").each(function() {
				var pos = ($(this).offset().top - aa.offset().top) + ($(this).height() / 2);
				window.existing.push(pos);
			});
		},
		out: function(ev, ui) {
			window.currentDroppable = null;
			$("div.temp").remove(); // begone, temporary preview divs
            window.place_under = null;

			resize_area(aa);
		}
	});
}

function start_drops() // actually turns the droppable areas on
{
	$(".frog3").droppable("enable");
	$(".frog3").each(function()
	{
		$(this).addClass("editmode_nested_page_active_area");
	});
}

function stop_drops()
{
	$(".frog3").droppable("disable").removeClass("editmode_nested_page_active_area").filter("div.nested_page_active_area").css("height", "auto");
}

function destroy_drops()
{
	$(".frog3").droppable("destroy").removeClass("editmode_nested_page_active_area").filter("div.nested_page_active_area").css("height", "auto");
}

function activate_areas(the_content)
{
	if(the_content.find(".nested_page_active_area").length > 0)
	{
		the_content.find(".nested_page_active_area").addClass("frog3").css({"height":"auto !important", "height":"100px", "min-height":"100px"});
		var container_to_publish = $("body").find(".ajax_qe:first").attr("id").replace(/ajax_qe_/, "");
		container_to_publish = container_to_publish.substring(0, container_to_publish.indexOf("_"));

		show_working_message("fullscreen");

		$.ajax(
		{
			url: "/myfrogtrade/frog3_publish.phtml",
			async: false,
			type: "POST",
			data: ({container_page:container_to_publish}),
			success: function(msg)
			{
				remove_working_message("fullscreen");
			}
		});
	}
}
/* EDIT AND DELETE BUTTONS */
function setup_configs() // sets up all the configure / delete buttons
{
	$("div.frog3 > div.nested_page, div.frog3 > div.s_uwa_container").each(function() // add config actions to anything that should have them
	{
		setup_individual_config(this);
		$(this).bind("mouseover", function()
		{
			$(this).addClass("editmode_hover");
		}).bind("mouseout", function()
		{
			$(this).removeClass("editmode_hover");
		});
	});
}

function setup_individual_config(nested_page) // sets up one particular set of config buttons
{
	var parent_area = $(nested_page).closest(".frog3"),
        np = $(nested_page);
	np.addClass("editmode").data("open", false);

	if($("> .buttons", np).length == 0) {
		np.append("<div class='buttons'><a href='#' class='delete_button'></a></div>");
	}
	$("> .buttons .config_button", np).remove();
        
        if($(nested_page).hasClass('s_uwa_container') || $(nested_page).children('.brick').hasClass('s_uwa_container')) { // is a UWA widget           
            if($(".config_button", $("> .buttons", nested_page)).length == 0 || $(nested_page).children('.s_uwa_container').length == 0) {
                    $("> .buttons", nested_page).prepend("<a href='#' class='config_button'></a>");
            }
            
            if(np.find('.brick').hasClass('s_uwa_container')){
                var page_context = np.find('.s_uwa_container:first');
            }else{
                var page_context = np;
            }
            
            $("> .buttons .config_button", nested_page).click(function(){
                    page_context.data("open", true);
                    window.onbeforeunload = confirm_leave;
                    var parts = page_context.attr("id").replace(/np_/, "").split("-");
                    var d_args=new Array();
                    d_args[0] = "/mywebsite/direct_edit_canvas.phtml?from_toolkit=0&from_webpage=1&profile_to_use=client_profile&frog3_uwa=true&daction=editframe&document_id="+parts[0]+"&sequence="+parts[1];
                    var ret = XshowModalDialog("/include/dialogContainer.phtml",d_args,"dialogHeight: 150px; dialogWidth: 150px; center: Yes; help: No; resizable: No; status: No;");

                    if(ret !== false) {
                            $.post("/myfrogtrade/frog3_getbrick.phtml?t=" + new Date().getTime(), {"id":page_context.attr("id")}, function(otherResponseText) {
                                    if(otherResponseText.indexOf("|JS|") != -1) {
                                            var frame_id = otherResponseText.replace(/\|JS\|/, "");
                                            $.post("/myfrogtrade/frog3_geticon.phtml", {"id":frame_id}, function(anotherResponseText) {
                                                    page_context.html("<div class='frog2'><img src='" + anotherResponseText + "' style='width: 40px; height: 40px; float: left;' /><p style='float: left; margin-left: 5px; text-align: left;'>Changes have been made which cannot be viewed without saving the page.  When you save the page, it will be refreshed so that you can see the effect of your changes.</p></div>");
                                                    if(!$(document).data("refresh_afterwards")) { // refresh, if it's not in an iframe
                                                            $(document).data("refresh_afterwards", !$(this).parents("div.scrollframe_replacement:first").length);
                                                    }

                                                    setup_configs();
                                                    setup_drags();
                                            });
                                    } else {
                                            page_context.html(otherResponseText);
                                            setup_configs();
                                            setup_drags();
                                    }
                            });

                            return false;
                    }
            });
           
            
	}else if($(".ajax_qe:first", np).length == 1) { // Frog Widget
            var container_page;
            if(np.find("div.s_widget_area").length) {
                container_page = $("div.s_widget_area:first div.ajax_qe:first", np);
            } else {
                var conts = np.find(".ajax_qe"),
                    get_depth = function(cont) {
                        var i = 1;

                        while(cont.parentNode != nested_page) {
                            i++;
                            cont = cont.parentNode;
                        }

                        return i;
                    },
                    find_closest_container = function(conts) {
                        var i, closest_cont;                       

                        conts.each(function() {
                            var $this = $(this),
                                n = get_depth(this);

                            if(!i || n < i) {
                                i = n;
                                closest_cont = $this;
                            }          
                        });

                        return closest_cont;
                    };

                container_page = find_closest_container(conts);             
                // You'd think you could do $('.ajax_qe:first', np).   You can't.  Sizzle iteratively
                // trawls the DOM, so if there's an .ajax_qe that's 27 levels deep, but belongs to the
                // first child of np, that's perceived as being :first, even if there's an .ajax_qe as
                // the second child of np - hence the need for manual resolution
            }
        
		var document_id = container_page.attr("id").replace(/ajax_qe_/, "");
		document_id = document_id.substring(0, document_id.indexOf("_"));

		var url = "/classes/editsite/page_fields/can_has_fields.phtml?lookup_dfid=" + np.attr("id").replace(/np_/, "") + "&fname=page_fields&document_id=" + document_id;
        $.get(url, "", function(responseText) {
			if(responseText == "WIN") {
				if($(".config_button", $("> .buttons", np)).length == 0) {
					$("> .buttons", np).prepend("<a href='#' class='config_button'></a>");
				}

				$("> .buttons .config_button", np).click(function() {
					np.data("open", true);
					np.draggable("destroy"); /* don't let you drag it while prefs are open */

					var dfid = np.attr("dfid");
					var content = np.find("div.nested_page_active_area:first").html(); // if there are any active areas within this nested page, we need to make sure that these contents are put back in when we replace the HTML according to the user fields

					var parts = np.attr("id").replace(/np_/, "").split("-");
					var d_args=new Array();
					d_args[0] = "/myfrogtrade/frog3_userfields.phtml?from_toolkit=0&from_webpage=1&parent_document_id="+document_id+"&document_id="+parts[0]+"&sequence="+parts[1]+"&container_page="+container_page+"&dfid="+dfid;
					var ret = XshowModalDialog("/include/dialogContainer.phtml",d_args,"dialogHeight: 150px; dialogWidth: 150px; center: Yes; help: No; resizable: No; status: No;");
					
                    if(ret !== false) {
						// Has the containing nested page been nested anywhere else in this page?  If so, update all instances of it
						var containing_page = np.parents(".ajax_qe:first");
						var ajax_qe = containing_page.attr("id").replace(/ajax_qe_/, "");
						ajax_qe = ajax_qe.substring(0, ajax_qe.indexOf("_"));
						var instances_of_nested_page = $("div[id^=ajax_qe_" + ajax_qe + "]");
                        
                        if(!$("#helper_copy").length) {
                            $('body').append("<div id='helper_copy'></div>");
                        }

                        // In the future, if we ever need to pass in the ID of the page this widget is nested into, pass the ajax_qe variable
						$("#helper_copy").load("/myfrogtrade/frog3_updatepage.phtml?t=" + (+new Date) + "&type=" + dfid, "", function (responseText, textStatus, XMLHttpRequest)
						{                            
							if(instances_of_nested_page.length > 0)
							{
								instances_of_nested_page.each(function()
								{
									var the_id = $(nested_page).attr("id");
									var instance = $("#" + the_id, this);

									instance.html($("#helper_copy").html());
									instance.find("div.nested_page_active_area:first").html(content);

									var active_areas = instance.children().find("div.nested_page_active_area");
									if(active_areas.length > 0)
									{
										$(active_areas).each(function()
										{
											setup_individual_drop($(this));
											$(this).addClass("editmode_nested_page_active_area");
										});
									}

									if(instance.hasClass("editmode"))
									{
                                        var ins = instance.get(0);
										setup_individual_config(ins);
										setup_individual_drag(ins, 0);
									}
								});
							}

							$("#helper_copy").html("");
						});

						return false;
					}
				});
			} else {
				// no config button?  no need to have a 100% width buttons div, because it can overlap anything that might be nested
				$("> .buttons", nested_page).css("width", "20px");
			}
		});
	}

	$("> .delete_button", $("> .buttons", nested_page)).click(function()
	{
		window.onbeforeunload = confirm_leave;
		var document_id = $("div:first", nested_page).attr("id").replace(/ajax_qe_/, "");
		document_id = document_id.substring(0, document_id.indexOf("_"));

		$.post("/myfrogtrade/frog3_deletenestedpage.phtml", {"frame_id":$(nested_page).attr("id").replace(/np_/, ""), "container_page":document_id}, function(responseText)
		{
			if(debug) alert(responseText);

			$(nested_page).animate({ height: "1px", opacity: "hide" }, "slow", "", function()
			{
				var h = $(nested_page).height();
				$(nested_page).remove();
				reassign_ids(parent_area);
				resize_area(parent_area);
			});
		});
		return false;
	});
	
	resize_area(parent_area);
}

/* ALL OF THE ABOVE */
function setup_editor()
{
	//var now = +new Date;
	setup_drops();
	start_drops();
	setup_configs();
	setup_drags();
	//alert ('took ' + (+new Date));
}

/* INSERT CONTENT AND HOUSEKEEPING */
function insert_content(dropped_page_id, temp_div)
{
	window.inserted = false;

	var source = $("div#helper");

	if(source.html() == null)
	{
		var el = $("<div class='helper_temp'></div>").appendTo("body");
		el.load("/myfrogtrade/frog3_getpage.phtml?t=" + (+new Date) + "&strip_scripts=1&type=" + dropped_page_id, "", function()
		{
			$(".edit_link", el).hide();
			$(".edit_link", el).parent().hide();
            el.addClass('nested_page').addClass('widget').removeClass('helper_temp');
            source = el;
		});
	}

	var t2 = setInterval(function()
	{
		if(source.html() != null)
		{
            temp_div.html(source.html());
            source.remove();
            window.inserted = true;
			clearInterval(t2);
		}
	}, 100);
}

function reassign_ids(container, override)
{
	var sequence = 1;
	//sequence = $(container).children(":not(".nested_page")").length + 1;

	$("> div", container).each(function()
	{
		if($(this).hasClass("nested_page") || $(this).hasClass("brick"))
		{
			var current_id = $(this).attr("id").split("-");
			if(override)
			{
				current_id[0] = override;
			}
			$(this).attr("id", current_id[0] + "-" + sequence);
			if($(this).attr("dfid") == null && $(this).hasClass("nested_page"))
			{
				var temp_np = this;
				$.post("/myfrogtrade/frog3_find_dfid.phtml", {nested_page_id: $(temp_np).attr("id")}, function(responseText)
				{
					$(temp_np).attr("dfid", responseText);
				});
			}
			sequence++;
		}

	});
}

/* MENU FUNCTIONS */
function copy_iframes(the_frame)
{
	var inner_contents = $(the_frame).contents();
	var existing_f3s = inner_contents.find(".frog3").length;
	if(inner_contents.find("div.s_folder_tabs").length)
	{
		add_stylesheet('/include/tab_folders.css', top.document);
	}

	// sub frames
	inner_contents.find("iframe.frog_scroller_class").each(function()
	{
		try
		{
			var internal=this.contentWindow.document.location; //do nothing else here or any errors will be masked
		}
		catch(e)
		{
			var internal=false;
		}

		if(internal) // don't try and manipulate frames pointing externally
		{
			var temp_contents = $(this).contents().find("body");
			if(temp_contents.find(".frog3").length)
			{
				copy_iframes(this);
			}
			else
			{
				$(this).replaceWith("<div class='scrollframe_nofrog3'>" + temp_contents.html() + "</div>");
			}
		}
	});

	if(existing_f3s)
	{
		inner_contents.find("table.menubar_colour").hide();

		var the_contents = "";
		inner_contents.find("style").each(function()
		{
			if(this.href) {
				add_stylesheet(this.href, top.document);
			} else {
				the_contents += "<style type='text/css'>" + $(this).html() + "</style>";
			}
		});

		// The menubar causes peculiar problems if it is included in this way - this stops them, but it is probably not be the best way of tackling it

		var no_include = ['frog3', 'main', 'jquery', 'jquery-ui', 'activate_frog3', 'quick_edit', 'menubar'];

		if(!window.replaced_menubar)
		{
			$('head').append("<script>if(typeof(menubar) == 'undefined') { function menubar() {return true;} }</script>");
			window.replaced_menubar = true;
		}

		var tDH = top.document.getElementsByTagName("head")[0];

		inner_contents.find("script").each(function()
		{
			if(this.src)
			{
				var i = no_include.length;

				while(i--)
				{
					if(this.src.indexOf('/' + no_include[i] + '.js') >= 0)
					{
						var prevent_include = true;
					}
				}

				if(!prevent_include)
				{    
					var el = top.document.createElement('script');
					el.type = 'text/javascript';
					el.src = this.src;
					tDH.appendChild(el);
				}
			}
			else if($(this).html())
			{
				setTimeout(function()
				{
					$(tDH).append("<script>" + $(this).html() + "</script>");
				}, 1);
			}
		});

		the_contents += inner_contents.find("body").html();

		var new_div = "<div class='scrollframe_replacement' style='height: auto;'>" + the_contents + "</div>";
		$(the_frame).before(new_div);
		$("div.scrollframe_replacement img").css("display", "block");

		var tab_heights = Array();

		if(typeof(the_frame.onload) === 'function')
		{
			$("div.s_folder_tabs", inner_contents).each(function()
			{
				tab_heights.push(get_largest_tab(this));
			});
		}
	
		var style_properties =
		{
			"height":the_frame.style.height,
			"width":the_frame.style.width,
			"position":the_frame.style.position,
			"z-index":the_frame.style.zIndex
		};

		var frame_properties =
		{
			"id":the_frame.id,
			"src":the_frame.src,
			"allowTransparency":"allowtransparency",
			"scrolling":the_frame.scrolling,
			"height":the_frame.height,
			"style":style_properties,
			"tab_heights":tab_heights
		};

		window.copied_frames.push(frame_properties);
		
		// Remove original iframe
		$(the_frame).remove();
	}
	else
	{
		$(the_frame).replaceWith("<div class='scrollframe_nofrog3'>" + inner_contents.find('body').html() + "</div>");
	}
}

function init_widget_instructions()
{
    var hidden = false;
    $("div.s_widget_area").each(function(i, widgetarea)
    {
        if(!hidden) {
            var no_of_widgets = $(widgetarea).find('div.widget').length + $(widgetarea).find('div.s_uwa_container').length;
            if (no_of_widgets) {
                $("#widget_area_instructions").hide();
                hidden=true;
            } else {
                $("#widget_area_instructions").show();
            }
        }
    });
}

function setup_click_action() // to make the button to pull down the menu work
{
	init_widget_instructions();
	$("a#add_to_page", top.document).show();
	$("a#add_to_page", top.document).toggle(function()
	{ // Show menu, set up for editing
		$(document).data("refresh_afterwards", null);

		$("body").append("<iframe style='display: none;' id='login_iframe' />");
		$("iframe#login_iframe").attr("src", "/myfrogtrade/frog3_toolkitlogin.phtml");
		$("iframe#login_iframe").load(function()
		{
			$(this).remove();
		});

		$(this).text("Save and Exit");
		$(this).css("background-image", "url(/sysimages/frog3/save_and_close.png)");
		$("div#top_menu", top.document).load("/myfrogtrade/frog3_menu.phtml", "", function()
		{
            $("div#turn_wrapper").hide();
            
			window.copied_frames = [];
			
			$("iframe.frog_scroller_class").each(function(i)
			{
				//test if the content of the IFRAME is from the same domain
				//by attempting to access a tainted property
				try
				{
					var internal=this.contentWindow.document.location; //do nothing else here or any errors will be masked
				}
				catch(e)
				{
					var internal=false;
				}

				if(internal) // don't try and manipulate frames pointing externally
				{
					if($(this).contents().find("body").find(".frog3").length || $(this).contents().find("body").find("iframe.frog_scroller_class").length)
					{
						copy_iframes(this);
					}
				}
			});
            
            $('div.s_uwa_container > iframe').parent().append('<div class="frameCover" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background-color: transparent;"></div>');

			$("a").each(function()
			{
				if ($(this).attr("name")=='app_store_link') return true;   // allow the App Store link to maintain it's href attribute
				$(this).attr("temp_href", $(this).attr("href"));
				$(this).removeAttr("href");
			});

			$("a, span, td, table").each(function()
			{
				if(typeof(this.onclick) == "function")
				{
					this.tempOnClick = this.onclick;
					this.onclick = null;
				}
			});

			$("iframe.accordion_menu").prev().css("display", "block");

			$("div.s_folder_tabs div.tab_container ul.css-tabs").siblings("div.nav.left").css({ "left":"8px" });

			setup_editor();
			$(this).animate({ height: "show", opacity: "show" }, "fast");
            var drop_element = $.browser.msie ? $("div.ie_container:first", top.document) : $("body", top.document),
            menu_size = 185,
            button_size = 33,
			move_to = menu_size + 'px';
            
			$("div#add_page_div", top.document).animate({ top: menu_size + "px" }, "fast");
            
			if($.browser.msie)
			{
				var h = drop_element.height();
				drop_element.height(h - menu_size).css('position', 'absolute').css('top', move_to);
                $("a").filter(function(){ return !$(this).parents('div#frogdock').length; }).show();
			}
			else
			{
				drop_element.children("div:not('div#top_menu, div#add_page_div, div#fixed_footer')").each(function()
				{
					$(this).css("position", "relative");
					$(this).animate({ top: move_to }, {duration:200, complete:function(){
                            $("a").filter(function(){ return !$(this).parents('div#frogdock').length; }).show();
                    }});
				});
			}
		});
        $("#widget_area_instructions").hide();
	},function()
	{ // Hide the menu again
		$("div.temporary_spacer").remove();

		$(this).text("Saving...");
		$(this).css("background-image", "url(/sysimages/frog3/saving.png)");
		$(this).append("<img id='saving_anim' src='/sysimages/frog3/saving_anim.gif' style='position: absolute; top: 4px; left: 12px; width: 16px; height: 16px;' />");

		save_and_close();
        $("div#turn_wrapper").show();
	});
}

save_and_close = function(resource_refresh)
{
    if (resource_refresh == null) resource_refresh = false;
    var container_pages = [];
    // uwa widgets are hidden when the widget store is opened (somehow). show them again here
    $("div.s_uwa_container").show();
    $("div.ajax_qe").each(function()
    {
        var temp_div = $(this).attr("id").replace(/ajax_qe_/, "");
        temp_div = temp_div.substring(0, temp_div.indexOf("_"));
        if($.inArray(temp_div, container_pages) < 0)
        {
            container_pages.push(temp_div);
        }
    });
	

	var ids_inside_autolink_view = {};
		$('.s_auto_link').find('div').each(function(){
			var id = $(this).attr('id');
			if(id.match(/(np_([0-9]+))/)!= null){
				var end_idx = id.indexOf('-',0);
				var start_idx = id.indexOf('_',0);
				id = id.substring(start_idx+1, end_idx);
				ids_inside_autolink_view[id] = 1;
			}
		});
		var container_pages_no_autolink = Array();
		for(var i=0; i< container_pages.length; i++){
			if(typeof ids_inside_autolink_view[container_pages[i]] == 'undefined'){
				container_pages_no_autolink.push(container_pages[i]);
			}
		}
    container_pages_piped = container_pages_no_autolink.join("|");

    window.setTimeout(function() // put on its own thread - this stops the persistent IE "loading icon" problem
    {
        $.ajax( {
            url: "/myfrogtrade/frog3_publish.phtml",
            async: false,
            type: "POST",
            data: ({piped:container_pages_piped}),
            success: function(msg) {
                window.onbeforeunload = null;
                if($(document).data("refresh_afterwards") === true || resource_refresh) { // only ever set as null, false, or true, and we only ever want to refresh if === true
                    window.location.reload(true);
                }

                $("div.buttons").remove();
                $("div.frog3 > div.nested_page, div.frog3 > div.s_uwa_container").unbind("mouseover mouseout");
                $("div.editmode_hover").removeClass("editmode_hover");

                stop_drops();
                stop_drags();

                $("a#add_to_page").unbind("click");
                $("div#top_menu", top.document).animate({ height: "hide", opacity: "hide" }, "fast");
                $("div#add_page_div", top.document).animate({ top: "0px" }, {
                    duration : "fast",
                    complete : init_widget_instructions
                });

                $("a").each(function() {
                    if($(this).attr("temp_href")) {
                        $(this).attr("href", $(this).attr("temp_href")).removeAttr("temp_href");
                    }
                });

                $("a, span, td, table").each(function() {
                    if(typeof this.tempOnClick == "function") {
                        this.onclick = this.tempOnClick;
                    }
                });

                $("iframe.accordion_menu").prev().css("display", "none");

                if($.browser.msie) {
                    var menu_size = $("div#top_menu", top.document).height();
                    var drop_element = $(".ie_container:first", top.document);
                    var h = drop_element.height();
                    drop_element.height(h + menu_size).css('top', '0px');
                } else {
                    var drop_element = $("body", top.document);
                    $(drop_element).children(":not('#top_menu, #add_page_div, #fixed_footer')").each(function() {
                        $(this).animate({ top: "0px" }, "fast");
                    });
                }

                $($("div.scrollframe_replacement").get().reverse()).each(function() {
                    var frame_properties = window.copied_frames.shift();

                    // fix for IE6/7 bug where dynamically created iframes cannot be targeted by links
                    // This affects jQuery created elements, too, hence using conventional element creation
                    // (see: http://readystate4.com/2008/05/13/dynamically-creating-an-iframe-for-internet-explorer/)

                    var id = frame_properties.id;

                    var elString = $.browser.msie && parseInt($.browser.version,10) < 10 ? '<iframe id="' + id + '" name="' + id + '">' : 'iframe';
                    var o = document.createElement(elString);
                    o.className = "frog_scroller_class";
                    o.frameBorder = "0";
                    o.style.display = "none";

                    if(typeof window.Frames.locations[id] !== 'undefined') { // replace if necessary
                        o.src = window.Frames.locations[id];
                        $(o).load(window.Frames.load_handler);
                        delete frame_properties.src;
                    }

                    for(i in frame_properties) {
                        if(i === 'style') {
                            $(o).css(frame_properties[i]);
                        } else {
                            o[i] = frame_properties[i];
                        }
                    }

                    o.name = o.id;
                    $(this).after(o).remove();
                    o.style.display = "block";
                });

                $("a#add_to_page img#saving_anim").remove();
                $("a#add_to_page").text("Edit Page Contents");
                $("a#add_to_page").css("background-image", "url(/sysimages/frog3/add_content.png)");

                $("div.nested_page_active_area").removeClass('ui-state-disabled');
                $("div.inner").removeClass('ui-state-disabled');

                top.setup_click_action();
            }
        });
    }, 1);
}

function get_largest_tab(tabs)
{
	var largest_tab = 0;
	$('div.css-panes div.pane', tabs).each(function()
	{
		var h = $(this).height();
		if(h > largest_tab)
		{
			largest_tab = h;
		}
	});
	return largest_tab;
}

function resize_area(area) { // generic handler for whenever an area is touched
	if(!$(area).hasClass("inner")) {
        $(area).css("height", "auto");
        if($(area).height() < 100) {
            $(area).height(100);
        }
    }

}

/* PRESENTATIONAL AND CHECK FOR CHANGES FUNCTIONS */
function show_working_message(page_element) // "Busy working, do not close"
{
	if(page_element == "fullscreen")
	{
		var mt = $("#top_menu", top.document).height();
		var w = $(".ie_container", top.document).width();
		var h = $(".ie_container", top.document).height();

		$(".ie_container:first", top.document).wrapAll("<div id='busy_overlay'></div>").css("display", "none");

		$("#busy_overlay", top.document).width(w);
		$("#busy_overlay", top.document).height(h-mt);
		$("#busy_overlay", top.document).css("position", "absolute");
		$("#busy_overlay", top.document).css("top", mt + "px");
	}
	else
	{
		var w = $(page_element).width();
		var h = $(page_element).height();

		$(page_element).css("display", "none");
		if($("#busy_overlay").length == 0)
		{
			$(page_element).wrap("<div id='busy_overlay'>Working... Please do not navigate away from the page, or your changes will not be saved.</div>");
		}
		$("#busy_overlay").width(w);
		$("#busy_overlay").height(h);
	}
}

function remove_working_message(page_element) // "Done now"
{
	if(page_element == "fullscreen")
	{
		page_element = ".ie_container:first";
		$("#busy_overlay", top.document).children(".ie_container:first").insertBefore("#busy_overlay", top.document);
	}
	else
	{
		$(page_element).insertBefore("#busy_overlay");
	}
	$("#busy_overlay").remove();
	$(page_element).css("display", "block");

	$(".frog3").each(function()
	{
		resize_area(this);
	});
}

function confirm_leave() // The message when you try leaving without saving
{
	return "If you leave now, any changes you have made will not be saved.";
}

function isNode(o)
{
	return	(
				//typeof Node === "object" ? o instanceof Node :
				typeof o === "object" && typeof o.nodeType === "number" && typeof o.nodeName==="string"
			);
}

function activate_frog3(document_id, sequence, type)
{
	var np = $("div#ajax_qe_"+document_id+"_"+sequence).parent();
    var button = $("a#add_to_page", top.document);
    var top_body = $('body', top.document);
	var add_button = false;

	// check if user anywhere
	try {
		var can_use_editor = isNode(top.document);
	} catch(e) {
		var can_use_editor = false;
	}
        
	if(!np.hasClass("in_template") && can_use_editor)
	{
		var active_areas = $("div.nested_page_active_area, div.pane > div.inner[editable=1]", np);
		if(active_areas.length) {
            active_areas.addClass("frog3").filter(function() {
                return this.valign == '';
            }).css("vertical-align", "top");
            
            top_body.addClass("show_editbutton"); // If this is set, it says "don't hide the button"
            $(window).unload(function() { // any link followed gets shot of the button
                top_body.removeClass("show_editbutton");
            });
            
			setTimeout(function() { // Needs its own thread to ensure stylesheet is loaded before displaying
				button.css({"visibility":"visible", "display":"block"});
			}, 1);
            
            // This is so that the setup_click_action function is only ever called once - otherwise, the button behaves incorrectly
            if(button.hasClass("click_setup")) {
                add_stylesheet("/include/frog3.css", top.document);
                add_stylesheet("/include/frog3_menu.css", top.document);
                if($.browser.msie) {
                    add_stylesheet("/include/frog3_ie.css", top.document);
                }

                top.setup_click_action();
                button.removeClass("click_setup");
            }
		} else {
			$('div#edit_link_' + document_id + '_' + sequence).css('display', 'block').children('a').show();
		}
	}
}
