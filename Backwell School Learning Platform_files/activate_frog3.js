$(document).ready(function()
{
	//Returns true if it is a DOM node
	function isNode(o)
	{
		return	(
					//typeof Node === "object" ? o instanceof Node :
					typeof o === "object" && typeof o.nodeType === "number" && typeof o.nodeName==="string"
				);
	}

	//Returns true if it is a DOM element    
	function isElement(o)
	{
		return	(
					typeof HTMLElement === "object" ? o instanceof HTMLElement : //DOM2
					typeof o === "object" && o.nodeType === 1 && typeof o.nodeName==="string"
				);
	}

	try
	{
		var can_use_editor = isNode(top.document);
	}
	catch(e)
	{
		var can_use_editor = false;
	}
	
	if(can_use_editor == true)
	{
		if(typeof(window.onunload != 'function'))
		{
			window.onunload = function() /* The actual function if you try leaving without saving.  IE/Mozilla only, as the others don't support onbeforeunload */
			{
				if(typeof(window.onbeforeunload) == "function")
				{
					var container_pages = [];
					var temp_div_id = $('.ajax_qe:first').attr('id').replace(/ajax_qe_/, '');
					var temp_div_id = temp_div_id.substring(0, temp_div_id.indexOf('_'));
					container_pages.push(temp_div_id);

					$('.editmode').each(function()
					{
						var temp_div = $(this).attr('id').replace(/np_/, '');
						temp_div = temp_div.substring(0, temp_div.indexOf('-'));
						if($.inArray(temp_div, container_pages) < 0)
						{
							container_pages.push(temp_div);
						}
					});

					var w = 260, h = 140;
					var x = (screen.availWidth - w) / 2;
					var y = (screen.availHeight - h) / 2;

					/* we have to open a popup rather than do an AJAX request, because IE can't perform AJAX when the page has been unloaded */
					window.open('/myfrogtrade/frog3_revertchanges.phtml?container_pages=' + container_pages, 'default', 'toolbar=no,directories=no,location=no,status=yes,menubar=no,resizeable=no,scrollbar=yes,width='+w+',height='+h+',left='+x+',top='+y);
				}
			};

			/**************************************************************************/

			/* INITIAL SETUP */		
			/*
				Haxx0rs for IE, to emulate position: fixed in the bugfest from Redmond - essentially, everything appearing
				within an ie classed body that is outside a ie_container will appear as position: fixed, which is why we wrap
				all the current contents now, and prepend the divs afterwards.  In proper browsers, it doesn't make any
				difference to them, because they don't do the bits they don't need to.  We still include the ie_container for
				other browsers, because we use it to cover stuff
			*/

			

			if($.browser.msie)
			{
				$('body').addClass('ie');
				if (typeof hide_all_popups == 'function') {
					$('div.ie_container').scroll(hide_all_popups);
					// the problem with this fixed position hack for ie is that
					// the menu popup iframes are added *after* this has executed, and
					// therefore act as position:fixed not position:absolute. This
					// fix hides them on scroll, as it is too difficult to reliably
					// get their absolute position in the scrollable ie_container
					// if the iframes are placed in the container itself.
    			}
			}

			if(!$('body', top.document).hasClass('show_editbutton')) // This is the only effective way I have found of telling child iframes NOT to hide the button
			{
				setTimeout(function() { $('a#add_to_page', top.document).hide(); }, 1);
			}

			if($('a#add_to_page', top.document).length == 0) // add the button if it's not already present, and do the stuff it needs to
			{
				$('body', top.document).prepend('<div id="add_page_div"><a id="add_to_page" class="click_setup png" style="display: none; visibility: hidden;">Edit Page Contents</a></div>');
				$('body', top.document).prepend('<div id="top_menu"></div>');
			}
		}
	}
	else
	{
		return;
	}	
});
