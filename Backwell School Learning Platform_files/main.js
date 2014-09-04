var from_webpage = 0;

DROPBOX = { loaded: function() { return true; },
            submit: function() { return true; }
          }

_F = {
    pages: [],
    parent:[],
    activate: []
};

var auto_resizing_scrollframes = auto_resizing_scrollframes || {};
var auto_resizing_scrollframes_min = auto_resizing_scrollframes_min || {};
var time_loaded_webfiles = 0;

function recheck_body_size(ignore_shrink)
{
	ignore_shrink = ignore_shrink || false;
	try
	{
            if (window != window.parent && window.name != '' && window.parent.auto_resizing_scrollframes[window.name])
            {
                var p = window.parent.document.getElementById(window.name);
                var docHeight;
                if(!ignore_shrink) {
                        p.style.height = '1px';
                }
                //fix for FF - BUG ID: 21583
                if(($.browser.mozilla) || ($.browser.msie && parseFloat($.browser.version)>=10)) {
                    time_loaded_webfiles++;
                    timeout = setTimeout("recheck_body_size()", 500);
                }
                if(time_loaded_webfiles > 1)
                    clearTimeout(timeout);
                
                if(jQuery) {
                    docHeight = $(document).height();
                } else {
                    docHeight = document.body.scrollHeight;
                }
                if(window.parent.auto_resizing_scrollframes_min[window.name]){
                    if(window.parent.auto_resizing_scrollframes_min[window.name]>docHeight){
                        docHeight = window.parent.auto_resizing_scrollframes_min[window.name];
                    }
                }

                p.style.height = docHeight+'px';
                window.parent.recheck_body_size();
            }
		return true;
	}
	catch (e)
	{
		return false;
	}
}

tt = window.location.search.split('from_webpage=');
if(tt.length > 1)
{
	if(tt[1].length > 1)
	{
		tt[1] = tt[1].substring(0,1);
	}
	if(tt[1] == 1)
	{
		from_webpage = 1;
	}
}

function ed_section_refresh()
{
	//dummy function to prevent errors being thrown, overwritten by lesson section editor
}

function ft_open_new_window(width,height,nav_tools,show_status,enable_scroll,enable_resize,var_selected_link_type,url,xpos,ypos)
{
	if(var_selected_link_type=='i')
	{
		temp_url = url.split('|');
		var_url = location.protocol+'//'+location.host+'/index.phtml?d='+temp_url[0];
	}
	else if(var_selected_link_type=='f')
	{
		temp_url = url.split('|');
		var_url = location.protocol+'//'+location.host+temp_url[0];
	}
	else if(var_selected_link_type=='x')
	{
		temp_url = url.split('|');
		var_url = location.protocol+'//'+location.host+'/association.phtml?lookup=' + temp_url[0];
	}
	else if(var_selected_link_type=='a')
	{
		temp_url = url.split(',');
		var_extra_location_info = '';
		if (temp_url[0] == 'open_frogshare')
		{
			// We have a frog share in a popup window!
			if (temp_url[2] && (temp_url[2] != 'default'))
			{
				var_extra_location_info = '&dest_type='+temp_url[2]+'&dest_val='+temp_url[3];
			}

			var_url = '/myfrogtrade/frogshare_spoke_openhub.phtml?site_id=' + temp_url[1] + var_extra_location_info;
		}
	}
	else
	{
		var_url = url;
	}

	if (width)
	{
		properties = "width="+width;
	}else
	{
		properties = "";
	}
	if (height)
	{
		properties += (properties?",":"")+"height="+height;
	}

	if (nav_tools)
	{
		properties += (properties?",":"")+"toolbar=yes,location=yes,menubar=yes";
	}

	if (show_status)
	{
		properties += (properties?",":"")+"status=yes";
	}

	if (enable_scroll)
	{
		properties += (properties?",":"")+"scrollbars=yes";
	}

	if (enable_resize)
	{
		properties += (properties?",":"")+"resizable=yes";
	}

	if (typeof(xpos) != 'undefined')
	{
		properties += (properties?",":"")+"left="+xpos+"px";
	}

	if (typeof(ypos) != 'undefined')
	{
		properties += (properties?",":"")+"top="+ypos+"px";
	}

	window.open(var_url,'',properties);
}

function ftpr_go_to_location(var_location,nav_target)
{
	if (nav_target == 'current')
	{
		window.location=var_location;
	}
	else if (nav_target == 'current_crystal')
	{
		parent.window.location=var_location;
	}
	else if (nav_target == 'new')
	{
		window.open(var_location);
	}
	else if (nav_target == 'jscript')
	{
		temp_val = var_location.split('javascript:');
		eval(temp_val[1]);
	}
	else
	{
		this_target_frame = find_frame(top,nav_target);
		// Find out if the frame is currently home to an internal, or external document
		try {
			var internal = this_target_frame.document.location.href;
		} catch(e) {
			var internal = false;
		}

		if(internal) { // internal page in frame, set location directly on window object
			this_target_frame.location = var_location;
		} else { // external link in frame, set location using frame in parent document instead
			if(parent.document.getElementById(nav_target)) {
				parent.document.getElementById(nav_target).src = var_location;
			} else if(document.getElementById(nav_target)) {
				document.getElementById(nav_target).src = var_location;
			} else if (nav_target && nav_target != ''){ // open in new window if frame can't be accessed
				window.top.open(var_location,nav_target);
			} else {
				window.open(var_locaation);
			}
		}
	}
}

function ns4_find_layer(object_id,var_layer)
{
	// this function attempts to find an object in the ns4 DOM and returns it.
	var i;
	for (i = 0;i < var_layer.layers.length;i++)
	{
		if (object_id == var_layer.layers[i].id)
		{
			return var_layer.layers[i];
		}else
		{
			return_layer = ns4_find_layer(object_id,var_layer.layers[i]);
			if (return_layer != null)
			{
				return return_layer;
			}
		}
	}
	return null;
}

/********************************** Utility functions ***********************/

var frg_pre_images=new Array();

function preload_images()
{
	// How this function works
	// preload_images("/sysicons/spacer.gif","/sysicons/whatever.gif");

	for (i=0;i<preload_images.arguments.length;i++){
		frg_pre_images[i]=new Image();
		frg_pre_images[i].src=preload_images.arguments[i];
		}
}

function add_slashes(var_string)
{
	//escape the backslashes
	var_string = var_string.split("\\");
	var_string = var_string.join("\\\\");

	//escape the double quotes
	var_string = var_string.split('"');
	var_string = var_string.join('\\"');

	//escape the single quotes
	var_string = var_string.split("'");
	var_string = var_string.join("\\'");

	return var_string;
}

function trim_whitespace(var_string)
{
	var zx_re = /[ \f\n\r\t\v]*$/g;
	var_string = var_string.replace(zx_re, "");
	zx_re = /^[ \f\n\r\t\v]*/g;
	return var_string.replace(zx_re, "");
}

function html_encode(var_text)
{
	tmp = var_text.split("&");
	var_text = tmp.join("&amp;");

	tmp = var_text.split("\"");
	var_text = tmp.join("&quot;");

	tmp = var_text.split("'");
	var_text = tmp.join("&#039;");

	tmp = var_text.split("<");
	var_text = tmp.join("&lt;");

	tmp = var_text.split(">");
	var_text = tmp.join("&gt;");

	return var_text;
}

function html_decode(var_text)
{
	tmp = var_text.split("&gt;");
	var_text = tmp.join(">");

	tmp = var_text.split("&lt;");
	var_text = tmp.join("<");

	tmp = var_text.split("&#039;");
	var_text = tmp.join("'");

	tmp = var_text.split("&quot;");
	var_text = tmp.join("\"");

	tmp = var_text.split("&amp;");
	var_text = tmp.join("&");

	return var_text;
}

function get_offset_x(var_object, var_top_object)
{
	if (typeof(var_top_object) == 'undefined') var_top_object = top;

	same_ids = ((typeof(var_object.id) != 'undefined') && (var_top_object.id == var_object.id));
	same_names = ((typeof(var_object.name) != 'undefined') && (var_top_object.name == var_object.name));
	is_body_tag = (var_object.tagName == 'BODY');

	if (same_ids || same_names || is_body_tag)
	{
		return 0;
	}else
	{
		var_parent = var_object.offsetParent;
		return var_object.offsetLeft + get_offset_x(var_parent, var_top_object);
	}
}

function get_offset_y(var_object, var_top_object)
{
	if (typeof(var_top_object) == 'undefined') var_top_object = top;

	same_ids = ((typeof(var_object.id) != 'undefined') && (var_top_object.id == var_object.id));
	same_names = ((typeof(var_object.name) != 'undefined') && (var_top_object.name == var_object.name));
	is_body_tag = (var_object.tagName == 'BODY');

	if (same_ids || same_names || is_body_tag)
	{
		return 0;
	}else
	{
		var_parent = var_object.offsetParent;
		return var_object.offsetTop + get_offset_y(var_parent, var_top_object);
	}
}

function get_cookie(Name) {
  var search = Name + "="
  var returnvalue = "";
  if (document.cookie.length > 0) {
    offset = document.cookie.indexOf(search)
    // if cookie exists
    if (offset != -1) {
      offset += search.length
      // set index of beginning of value
      end = document.cookie.indexOf(";", offset);
      // set index of end of cookie value
      if (end == -1) end = document.cookie.length;
      returnvalue=unescape(document.cookie.substring(offset, end))
      }
   }
  return returnvalue;
}

function set_cookie(name,value,days) {
	if (days) {
		var date = new Date();
		date.setTime(date.getTime()+(days*24*60*60*1000));
		var expires = "; expires="+date.toGMTString();
	}
	else var expires = "";
	document.cookie = name+"="+value+expires+"; path=/";
}
/************************************ serialization functions ***************************************/
function find_frame(var_win,var_name)
{
	var fnd_i;
	var child1_win;
	var child2_win;

	for (fnd_i = 0; fnd_i< var_win.frames.length; fnd_i++)
	{
		child1_win = var_win.frames[fnd_i];

		// attempt to access the frame
		try
		{
			if (child1_win.name == var_name)
			{
				return child1_win;
			}else
			{
				child2_win = find_frame(child1_win,var_name);
				if (typeof(child2_win) == 'object')
				{
					return child2_win;
				}
			}
		}
		catch (e)
		{
			if (typeof(var_win.frames[var_name]) == 'object')
			{
				return var_win.frames[var_name];
			}
			// do nothing. we have no access to that particular frame
		}
	}
	return false;
}

var srlz_object_array;

srlz_object_array = new Array();
var srlz_string;

function srlz_clear_children()
{
	srlz_object_array = new Array();
}

function srlz_add_unique_child(var_object)
{
	if (!srlz_find_object(var_object))
	{
		//alert('added object. length is '+srlz_object_array.length);
		srlz_object_array[srlz_object_array.length] = var_object;
	}else
	{
		//alert('not added object. length is '+srlz_object_array.length);
	}
}

function srlz_find_object(var_object)
{
	if (typeof(srlz_object_array) == 'object')
	{
		for (key in srlz_object_array)
		{
			if (var_object == srlz_object_array[key])
			{
				//alert('found');
				return key;
			}
		}
	}
	return false;
}

function srlz_length(var_object)
{
	return_len =0;
	for (key in var_object)
	{
		return_len++;
	}
	return return_len;
}

function serialize_array(var_array)
{
	srlz_clear_children();
	return srlz_serialize('1',var_array);
}

function srlz_serialize(var_key,var_array)
{
	var return_string = '';

	var_key_len = var_key.toString().length;

	object_ref = srlz_find_object(var_array);
	if (!object_ref)
	{
		//alert(var_key);
		//alert(var_array);
		srlz_add_unique_child(var_array);

		var_len = srlz_length(var_array);
		//alert(var_len)
		return_string += "o["+var_key_len+"|"+var_len+"]:"+var_key.toString()+":";
		for (key in var_array)
		{
			this_object = var_array[key];

			switch(typeof(this_object))
			{
				case 'string':
					//alert('string');

					var_key_len = key.toString().length;
					var_len = this_object.length;

					return_string += "s["+var_key_len+"|"+var_len+"]:" + key.toString() + ":" + this_object;
					//alert(return_string);
				break;
				case 'number':
					//alert('number');

					var_key_len = key.toString().length;
					var_len = this_object.toString().length;

					return_string += "n["+var_key_len+"|"+var_len+"]:" + key.toString() + ":" + this_object.toString();
					//alert(return_string);
				break;
				case 'boolean':
					//alert('boolean');

					var_key_len = key.toString().length;
					var_len = this_object.toString().length;

					return_string += "b["+var_key_len+"|"+var_len+"]:" + key.toString() + ":" + this_object.toString();
					//alert(return_string);
				break;
				case 'function':
					//alert('function');
					var_key_len = key.toString().length;
					return_string += "f["+var_key_len+"|0]:"+ key.toString() +":";
					//alert(return_string);
				break;
				case 'object':
					//alert('object');

					var_len = this_object.toString().length;
					return_string += srlz_serialize(key.toString(),this_object);

					//alert(return_string);
				break;
				case 'undefined':
					//alert('undefined');
					//alert(return_string);
				break;
			}
		}
	}else
	{
		var_len = object_ref.toString().length;
		return_string += "r["+var_key_len+"|"+var_len+"]:"+var_key.toString()+":"+object_ref.toString();
	}
	return return_string;
}


function srlz_get_keyvalue_pair()
{
	open_position = 1;
	close_position = srlz_string.indexOf("]");
	keyvalue_lengths = srlz_string.substr(open_position,close_position-1);

	srlz_string = srlz_string.substring(close_position+2);

	keyvalue_lengths = keyvalue_lengths.split("|");

	return_array = new Array();
	return_array["key"] = srlz_string.substr(0,keyvalue_lengths[0]);
	//alert("KEY :"+return_array["key"]);

	return_array["value"] = srlz_string.substr(parseInt(keyvalue_lengths[0])+1,keyvalue_lengths[1]);

	// If original value string contained quotes, they were escaped, and the escape character was included in the length: so take this into account and redo strings
	// THIS WILL FALL DOWN IF THERE ARE EVER LINKS CONTAINING A LOT OF QUOTES, SO DON'T USE THEM IN LINKS
	if(return_array['value'].indexOf('[') >= 0) {
		var quotes = return_array['value'].match(/['"]/g);
		if(quotes && quotes.length) {
			keyvalue_lengths[1] -= quotes.length;
			return_array["value"] = srlz_string.substr(parseInt(keyvalue_lengths[0])+1,keyvalue_lengths[1]);
		}
	}

	//alert("VAL :"+return_array["value"]);

	srlz_string = srlz_string.substr(parseInt(keyvalue_lengths[0])+parseInt(keyvalue_lengths[1])+1);

	return return_array;
}

function srlz_get_keyarray_pair()
{
	open_position = 1;
	close_position = srlz_string.indexOf("]");
	keyvalue_lengths = srlz_string.substr(open_position,close_position-1);

	//alert("START: "+keyvalue_lengths );

	srlz_string = srlz_string.substring(close_position+2);


	keyvalue_lengths = keyvalue_lengths.split("|");
//	alert("KEY|COUNT LEN = "+keyvalue_lengths[0]+"|"+keyvalue_lengths[1]);

	return_array = new Array();
	return_array["key"] = srlz_string.substr(0,keyvalue_lengths[0]);
//	alert("KEY :"+return_array["key"]);

	return_array["item_count"] = keyvalue_lengths[1];
//	alert("ITEM COUNT :"+return_array["item_count"]);

//	alert("1:  "+srlz_string);

	srlz_string = srlz_string.substr(parseInt(keyvalue_lengths[0])+1);
//	alert("2:  "+srlz_string);

	return return_array;
}

function unserialize_array(var_string)
{
	if (var_string)
	{
		srlz_string = var_string;
		var ret_string;

		eval_string  = "unsrlz_paths = new Array();\n"
		eval_string  = "srlz_temp_object = new Object;\n"
		eval_string += srlz_unserialize(1,"srlz_temp_object");
		eval(eval_string);
		return srlz_temp_object[1];
	}else
	{
		return;
	}

}

function srlz_unserialize(element_count,path)
{
	var element;
	var return_string;
	return_string = "\n";
	if (typeof(srlz_un_paths) == 'undefined')
	{
		srlz_un_paths = new Array();
	}

	while ((srlz_string != '') && (element_count>0))
	{
		//alert("elemnent count is "+element_count);
		//alert(srlz_string);
		element_type = srlz_string.substr(0,1);
		srlz_string = srlz_string.substr(1);

		switch(element_type)
		{
			case 's':
				//alert('START STRING:'+srlz_string);
				element = srlz_get_keyvalue_pair();

				return_string += path+"[\""+add_slashes(element['key'])+"\"] = \""+add_slashes(element['value'])+"\";\n";

				//alert('END STRING: '+srlz_string);
			break;
			case 'n':
				//alert('NUMBER:'+srlz_string);
				element = srlz_get_keyvalue_pair();

				return_string += path+"[\""+add_slashes(element['key'])+"\"] = "+element['value']+";\n";

				//alert(element+ ' : '+srlz_string);
			break;
			case 'b':
				//alert('BOOLEAN:'+srlz_string);
				element = srlz_get_keyvalue_pair();

				return_string += path+"[\""+add_slashes(element['key'])+"\"] = "+(element['value']?"true":"false")+";\n";
				//alert(element+ ' : '+srlz_string);
			break;
			case 'f':
				//alert('FUNCTION:'+srlz_string);
				element = srlz_get_keyvalue_pair();

				return_string += path+"[\""+add_slashes(element['key'])+"\"] = srlz_function_not_set;\n";

				//alert(element+ ' : '+srlz_string);
			break;
			case 'o':
				//alert('START OBJECT:'+srlz_string);
				element = srlz_get_keyarray_pair();

				return_string += path+"[\""+add_slashes(element['key'])+"\"] =  new Object();\n";

				srlz_un_paths[srlz_un_paths.length] =  path+"[\""+add_slashes(element['key'])+"\"]";


				return_string += srlz_unserialize(element['item_count'],path+"[\""+add_slashes(element['key'])+"\"]");

				//alert('END OBJECT: : '+srlz_string);
			break;
			case 'r':
				//alert('REFERENCE:'+srlz_string);
				element = srlz_get_keyvalue_pair();

				return_string += path+"[\""+add_slashes(element['key'])+"\"] = "+srlz_un_paths[element['value']]+";\n";

				//return_array[element['key']] = element['value'];
				//alert(element+ ' : '+srlz_string);
			break;
		}
		element_count--;
	}
	return return_string
}

function srlz_function_not_set(name)
{
	alert("An unserialized javascript object has not set one of it's functions.");
	return false;
}

// Frogtrade Functions for the actions used in links
function open_toolkit()
{
	window.open('/login.phtml');
}

function unpack_frg(fileid)
{
	var args = fileid.split(",",3);//folderid "hacked into" fileid
	//3rd for localfiles
	var d_args=new Array();

	d_args[0]='/mywebsite/site_import_tags.phtml?link_action=true&from_webpage=1&'+(args[1]?'folder_id='+args[1]+'&':'')+'filename_physical=' + args[0] + '&local_files=' + args[2]+'&usetemplates=import';

	//alert(d_args);
	XshowModalDialog('/include/dialogContainer.phtml',d_args,'dialogHeight:150px;dialogWidth:150px;center:Yes;help:No;resizable:No;status:No;');

	window.document.location=window.document.location;
}

function delete_page(args)
{
	var args = args.split(',');
	var d_args=new Array();
	if(confirm('Are you sure you want to delete this?'))
	{
		d_args[0]='/myfrogtrade/delete_page.phtml?from_webpage=1&ufid=' + args[0];
		XshowModalDialog('/include/dialogContainer.phtml',d_args,'dialogHeight:150px;dialogWidth:150px;center:Yes;help:No;resizable:No;status:No;');
		if (args[1] > 0)
		{
			d_args[1]='/index.phtml?d=' + args[1];
			window.document.location = d_args[1];
		}
		else
		{
			window.document.location=window.document.location;
		}
	}
}

//After refresh page for delete_page
function link_popup_get_delete_refresh_page(arg_current_page)
{
	get_delete_refresh = 1;
	CrLink = window.XshowModalDialog('/classes/editsite/link_popup/link_popup.phtml?type=ft_pages_only&from_webpage='+from_webpage, Array(window), 'dialogWidth:30px;dialogHeight:30px;center:yes;status:no;');
	return 1;
}

//Create lesson using current page as a resource
function create_lesson()
{
	var ufid = arguments[0].split(',')[0];

	var dialogContainer = '/include/dialogContainer.phtml';
	var dialogOptions  = 'dialogHeight:150px;dialogWidth:350px;';
			dialogOptions += 'center:Yes;help:No;resizable:No;status:No;';

	var url = '/wp/library/lesson_planning_components/quick_issue.phtml?';
	url += 'ufid=' + ufid;

	showModalDialog(dialogContainer, Array(url), dialogOptions);
}

//Change login page link action setup
function link_popup_choose_login_page()
{
	CrLink = window.XshowModalDialog('/classes/editsite/link_popup/link_popup.phtml?type=ft_pages_only&from_webpage='+from_webpage, Array(window), 'dialogWidth:30px;dialogHeight:30px;center:yes;status:no;');
	return 1;
}

//Change login page link action
function change_login_page(arg_document_id)
{
	var d = arg_document_id;
	if (!d)
	{
		return false;
	}

	var confirmed = confirm('Are you sure you wish to change your login page?');

	if (confirmed)
	{
		var url = '/myfrogtrade/change_login_page.phtml?from_webpage=1&d=' + d;

		XshowModalDialog('/include/dialogContainer.phtml',
			Array(url),
			'dialogHeight:150px;dialogWidth:350px;center:Yes;help:No;resizable:No;status:No;'
		);

		top.document.location = '/index.phtml?d=' + d;
	}

}

//Go to a user's home page
function goto_home_page()
{
	//home.phtml finds the current user's home page id and redirects to it
	top.document.location = '/home.phtml';
}

function live_edu_login()
{
	window.open('\live_edu_sso.phtml', '_blank');
}

function live_edu_sky_drive()
{
	window.open('\live_edu_sso.phtml?target=skydrive', '_blank');
}

function live_edu_fullclient()
{
	window.open('\live_edu_sso.phtml?target=fullclient', '_blank');
}

function google_docs(){
	window.open('\googledomain_redirect.php', '_blank');
}

function page_properties(args)
{
	var args = args.split(',');
	//alert(args);
var d_args=new Array();
	d_args[0]='/myfrogtrade/edit_page_properties.phtml?link_action=true&from_webpage=1&'+(args[1]?'n='+args[1]+'&':'')+(args[2]?'d='+args[2]+'&':'')+(args[3]?'i='+args[3]+'&':'')+(args[4]?'a='+args[4]+'&':'')+(args[5]?'t='+args[5]+'&':'')+(args[6]?'p='+args[6]+'&':'')+'ufid=' + args[0];


	XshowModalDialog('/include/dialogContainer.phtml',d_args,'dialogHeight:150px;dialogWidth:150px;center:Yes;help:No;resizable:No;status:No;');

	window.document.location=window.document.location;
}

function page_userfields(args)
{
    var args = args.split(',');
    var d_args=new Array();
    d_args[0]='/mywebsite/page_userfields.phtml?link_action=true&from_webpage=1&ufid=' + args[0];
    XshowModalDialog('/include/dialogContainer.phtml',d_args,'dialogHeight:150px;dialogWidth:150px;center:Yes;help:No;resizable:No;status:No;');
    window.document.location=window.document.location;
}

function page_background(args)
{
    var args = args.split(',');
    var d_args=new Array();
    d_args[0]='/mywebsite/page_background.phtml?link_action=true&from_webpage=1&ufid=' + args[0];
    XshowModalDialog('/include/dialogContainer.phtml',d_args,'dialogHeight:150px;dialogWidth:150px;center:Yes;help:No;resizable:No;status:No;');
    window.document.location=window.document.location;
}

function edit_meta(args)
{
	var args = args.split(',');
	var d_args=new Array();

	if(args[4]=='true')
	{
		d_args[0]='/myfrogtrade/predef_meta_tags.phtml?link_action=true&from_webpage=1&'+(args[5]?'t='+args[5]+'&':'')+(args[6]?'v='+args[6]+'&':'')+(args[7]?'a='+args[7]+'&':'')+'ufid=' + args[0];

	}
	else
	{
		d_args[0]='/myfrogtrade/edit_meta_tags.phtml?link_action=true&from_webpage=1&'+(args[1]?'t='+args[1]+'&':'')+(args[2]?'d='+args[2]+'&':'')+(args[3]?'k='+args[3]+'&':'')+'ufid=' + args[0];
	}

	XshowModalDialog('/include/dialogContainer.phtml',d_args,'dialogHeight:150px;dialogWidth:150px;center:Yes;help:No;resizable:No;status:No;');

	window.document.location=window.document.location;
}

function delete_meta(args)
{
	var args = args.split(',');
	var d_args=new Array();

	d_args[0]='/myfrogtrade/delete_meta_tags.phtml?link_action=true&from_webpage=1&'+(args[1]?'tc='+args[1]+'&':'')+(args[2]?'dc='+args[2]+'&':'')+(args[3]?'kc='+args[3]+'&':'')+(args[4]?'p='+args[4]+'&':'')+(args[5]?'v='+args[5]+'&':'')+'ufid=' + args[0];

	XshowModalDialog('/include/dialogContainer.phtml',d_args,'dialogHeight:150px;dialogWidth:150px;center:Yes;help:No;resizable:No;status:No;');

	window.document.location=window.document.location;
}


function create_page(args)
{
	var args = args.split(',');
//alert(args);
	var d_args=new Array();
	d_args[0]='/myfrogtrade/create_new_page.phtml?link_action=true&from_webpage=1&'+(args[1]?'n='+args[1]+'&':'')+(args[2]?'d='+args[2]+'&':'')+(args[3]?'i='+args[3]+'&':'')+(args[4]?'a='+args[4]+'&':'')+(args[5]?'t='+args[5]+'&':'')+(args[6]?'l='+args[6]+'&':'')+(args[7]?'sf='+args[7]+'&':'')+(args[8]?'sfn='+encodeURIComponent(args[8])+'&':'')+(args[9]?'cpid='+args[9]+'&':'')+(args[10]?'ra='+args[10]+'&':'')+'ufid=' + args[0];


	XshowModalDialog('/include/dialogContainer.phtml',d_args,'dialogHeight:150px;dialogWidth:150px;center:Yes;help:No;resizable:No;status:No;');

	window.document.location=window.document.location;
}

function move_page(args)
{
    var args = args.split(',');
    if(isNaN(parseInt(args[1]))){
        var d_args = new Array();
        d_args[0]='/mywebsite/move_folder.phtml?f_type=unique_frame_id&previous_folder_id=0&unique_frame_id='+args[0]+'&from_webpage=1';
        d_args[1]='';
        d_args[2]='';
        d_args[3]='';
        var_return_value = XshowModalDialog('/include/dialogContainer.phtml', d_args, 'dialogHeight:150px;dialogWidth:150px;center:Yes;help:No;resizable:No;status:No;');
		document.location = document.location;
    }else{
        var str = "Are you sure you want to move the page?"+args[2];
        var d_args = new Array();
        d_args[0]='/mywebsite/confirm_dialog.phtml?str='+encodeURI(str)+'&from_webpage=1';
        d_args[1]='';
        d_args[2]='';
        d_args[3]='';
        var_return_value = XshowModalDialog('/include/dialogContainer.phtml', d_args, 'dialogHeight:150px;dialogWidth:150px;center:Yes;help:No;resizable:No;status:No;');

        var url = "/mywebsite/editpages.phtml?from_webpage=1";
        url += "&daction=movefolder";
        url += "&move_id="+args[0];
        url += "&f_type=unique_frame_id";
        url += "&previous_folder_id=0";
        url += "&unique_frame_id="+args[0];

        if(var_return_value == true){
            $.post(url, {"invisible_text": args[1]},
                function(data) {
					document.location = document.location;
                });
            }
    }
	
}

function delete_dropbox_file(args)
{
  var args = args.split(',');

  var d_args = new Array();

  d_args[0] = '/myfrogtrade/dropbox_delete_file.phtml?link_action=true&from_webpage=1&fid='+args[0];

  ret = XshowModalDialog('/include/dialogContainer.phtml',d_args,'dialogHeight:150px;dialogWidth:150px;center:Yes;help:No;resizable:No;status:No;');

  document.location = document.location;

}

function download_dropbox_file(args)
{
  var args = args.split(',');
  var d_args = new Array();

  //d_args[0] = '/myfrogtrade/dropbox_download_file.phtml?link_action=true&from_webpage=1&fid='+args[0];

  // Do json to get filename?
	var today = new Date();
	var time = today.getTime();

  the_url = '/download.phtml?f='+args[0]+'&t='+time.valueOf()+'&from_webpage=1&dbd=1';
  document.location = the_url;

//  ret = XshowModalDialog('/include/dialogContainer.phtml',d_args,'dialogHeight:150px;dialogWidth:150px;center:Yes;help:No;resizable:No;status:No;');
}

function link_popup_select_theme(properties)
{
	var var_args = properties.split(",");

	if(var_args[0]=='select_theme')
		var_args[0] = var_args[1];

	window.XshowModalDialog('/classes/editsite/link_popup/theme_select_action.phtml?theme='+var_args[0]+'&from_webpage='+from_webpage, Array(window), 'dialogWidth:30px;dialogHeight:30px;center:yes;status:no;');

	return 1;
}

function select_theme(args)
{
	var args = args.split(',');
	var d_args = new Array();
	// Something..
	d_args[0] = '/myfrogtrade/theme_select.phtml?link_action=true&from_webpage=1&theme='+args[0];
	var res = XshowModalDialog('/include/dialogContainer.phtml',d_args,'dialogHeight:150px;dialogWidth:150px;center:Yes;help:No;resizable:No;status:No;');

	window.document.location = window.document.location;
}

function open_user_preferences()
{
    XshowModalDialog(
        '/mywebsite/user_preferences.phtml?from_webpage=1',
        'dialogHeight:300px;dialogWidth:750px;center:Yes;help:No;resizable:No;status:No;',
        ''
    );
    window.top.document.location=window.top.document.location;
}

function get_emails_for_relationship(type){
    if (get_url_variables()['selected_contact_id']) {
        var contact_id = get_url_variables()['selected_contact_id'];
    }
    else{
        var contact_id = 0;
    }
    $.get("/mywebsite/ajax_return_relationship_emails.php",
        {"contact_id":contact_id,"type":type},
        function(data) {
            if(data.errorcode==1){
                alert(data.returned);
            }
            else{
                window.location = "mailto:" + data.returned;
            }
        }
    );
}
function email_user_teachers()
{
	get_emails_for_relationship("teachers")
}


function email_user_parents()
{
    get_emails_for_relationship("parents")
}

function open_quick_homework()
{
	var dialogContainer = '/include/dialogContainer.phtml';
	var dialogOptions  = 'dialogHeight:150px;dialogWidth:350px;';
			dialogOptions += 'center:Yes;help:No;resizable:No;status:No;';
	var url = '/wp/library/lesson_planning_components/quick_issue.phtml?quick_type=2';
	showModalDialog(dialogContainer, Array(url), dialogOptions);    
}

function open_quick_issue()
{
	var dialogContainer = '/include/dialogContainer.phtml';
	var dialogOptions  = 'dialogHeight:150px;dialogWidth:350px;';
			dialogOptions += 'center:Yes;help:No;resizable:No;status:No;';
	var url = '/wp/library/lesson_planning_components/quick_issue.phtml?quick_type=1';
	showModalDialog(dialogContainer, Array(url), dialogOptions);    
}

function open_avatar_generator()
{
	if ($("div#avatar_generator_container").length < 1)
	{
		var av_cont = $("<div id='avatar_generator_container' ></div>");

        av_cont.css({
            'width': '640px',
            'height': '500px',
            'overflow' : 'hidden',
            'top' : '0px',
            'left' : '-5px'

        });
		var av_iframe = $("<iframe name='avatar' id='avatar' src='/include/avatar/index.phtml' frameborder='0' width='700' height='500' scrolling='no'></iframe><br/><br/><br/><br/>");
		$(av_cont).append(av_iframe);
		$('body').append(av_cont);
	}
	$('#avatar_generator_container').dialog({
		'modal': true,
		'width': 650,
		'height': 550,
		'resizable':false,
		'draggable':false,
		'close': function(){$(this).dialog('destroy');}
	});
}

function view_pars_report()
{
    var url = '/reports/pars.phtml';
    if (get_url_variables()['selected_contact_id']) {
        url += '?selected_contact_id=' + get_url_variables()['selected_contact_id'];
    }
    window.open(url,'pars_report', '_blank');
}

function create_workspace_subgroup(args)
{
  var args = args.split(',');
  var d_args = new Array();
  d_args[0] = '/myfrogtrade/create_workspace_subgroup.phtml?link_action=true&from_webpage=1&category='+args[0];
	XshowModalDialog('/include/dialogContainer.phtml',d_args,'dialogHeight:150px;dialogWidth:150px;center:Yes;help:No;resizable:No;status:No;');

	window.document.location=window.document.location;
}

function change_workspace_subgroup(args)
{
  // Needs to send current group
  var args = args.split(',');
  var d_args = new Array();

  var cat_id = -1;
  if(args[2]=='yes')
    cat_id = args[1];
  else
    cat_id = args[0];

  d_args[0] = '/myfrogtrade/change_workspace_subgroup.phtml?link_action=true&from_webpage=1&category='+cat_id;
	XshowModalDialog('/include/dialogContainer.phtml',d_args,'dialogHeight:150px;dialogWidth:150px;center:Yes;help:No;resizable:No;status:No;');

	window.document.location=window.document.location;
}

function delete_workspace_subgroup(args)
{
  // Needs to send current group
  var args = args.split(',');
  var d_args = new Array();

  var cat_id = -1;
  if(args[2]=='yes')
    cat_id = args[1];
  else
    cat_id = args[0];

  d_args[0] = '/myfrogtrade/delete_workspace_subgroup.phtml?link_action=true&from_webpage=1&category='+cat_id;
	XshowModalDialog('/include/dialogContainer.phtml',d_args,'dialogHeight:150px;dialogWidth:150px;center:Yes;help:No;resizable:No;status:No;');

	window.document.location=window.document.location;
}

function delete_workspace(args)
{
  // Pog delete workspace action
  var args = args.split(',');
  var d_args = new Array();

  var folder_id = args[0];
  var pageid = args[1];

    /*
  if(folder_id == 'current')
    doc_id = get_document_id();
`   */
  d_args[0] = '/myfrogtrade/delete_workspace.phtml?link_action=true&from_webpage=1&fid='+folder_id+'&pid='+pageid;
    var res = XshowModalDialog('/include/dialogContainer.phtml',d_args,'dialogHeight:150px;dialogWidth:150px;center:Yes;help:No;resizable:No;status:No;');

  // args will actually be a folder id

  if(pageid!=undefined)
  {
    var url = window.document.location;

    if ( pageid!=-1)
    url = 'index.phtml?d=' + pageid;

//  window.document.location = window.document.location;
    window.document.location = url;
  }
}

function create_folder(args)
{
	create_folder_exe(args, function(){document.location = document.location;});
}

function create_folder_exe(args, callback)
{
	var v = args.split(',');

	var url = '/myfrogtrade/create_new_folder.phtml' +
		'?link_action=true' +
		'&ufid=' + encodeURIComponent(v[0]) +
		'&folder_description=' + encodeURIComponent(v[1]) +
		'&template=' + encodeURIComponent(v[2]) +
		'&template_id=' + encodeURIComponent(v[3]) +
		'&custom_icon=' + encodeURIComponent(v[4]) +
		'&custom_icon_filename=' + encodeURIComponent(v[5]) +
		'&subfolder=' + encodeURIComponent(v[6]) +
		'&collab_enabled=' + encodeURIComponent(v[7]) +
		'&category=' + encodeURIComponent(v[8]) +
		'&copyof_page_or_frg=' + escape(v[9]) +
		'&copyof_id=' + encodeURIComponent(v[10]) +
		'&copyof_type=' + encodeURIComponent(v[11]) +
		'&access_type=' + encodeURIComponent(v[12]) +
		'&admin_permissions=' + encodeURIComponent(v[13]) +
    '&use_groupid=' + encodeURIComponent(v[14]) +
		'&from_webpage=1';
		if(v.length > 17){
			url += '&workspace_name=' + encodeURIComponent(v[15]);
			url += '&auto_enrol_parent=' + encodeURIComponent(v[16]); 
			url += '&auto_enrol_admin=' + encodeURIComponent(v[17]);
			url += '&document_ids='+encodeURIComponent(v[18]);
		}
	XshowModalDialog('/include/dialogContainer.phtml',
		Array(url),
		'dialogHeight:150px;dialogWidth:350px;center:Yes;help:No;resizable:No;status:No;'
	);
	if(typeof callback === 'function'){
		callback();
	}

}

function delete_folder(args)
{
	var parts = args.split(',');
	var uid = parts[0];
	var refresh_page = parts[1];
	var url = '/myfrogtrade/delete_folder.phtml?from_webpage=1&uid=' + uid + '&refresh_page=' + refresh_page;
	top.document.location = url;
}

function workspace_leave(args)
{
	var args = args.split(',');

	$.post("/myfrogtrade/workspace_leave.phtml","folder_id=" + args[0]+"&from_webpage=" + from_webpage);//, function(msg){ alert( "leave:" + msg );}

	if (args[1] > 0)
	{
		parent.window.document.location = '/index.phtml?d=' + args[1];
	}
	else
	{
		window.document.location=window.document.location;
	}
}

function workspace_join(args)
{
	var args = args.split(',');
/*
	var d_args=new Array();
	d_args[0]='/myfrogtrade/workspace_join.phtml?from_webpage=1&ufid='+args[0];*/

	$.post("/myfrogtrade/workspace_join.phtml","folder_id=" + args[0] +"&from_webpage=" + from_webpage);//, function(msg){ alert('join:'+msg );}

	if (args[1] > 0)
	{
		parent.window.document.location = '/index.phtml?d=' + args[1];
	}
	else
	{
		window.document.location=window.document.location;
	}
}

function wf_action(args)
{
	var args = args.split(',');
	wf_name = args[0];
	action = args[1];
	var safe_wf_name = wf_name.replace(/[^a-zA-Z0-9]/,'_');
	var action_to_perform = 'wf_' + safe_wf_name + '_' + action;
    if (validate(action_to_perform))
    {
		eval(action_to_perform+'();');
    }
	else
	{
		// function does not exist
	}


//		eval(action_to_perform + '();');

}

function validate(func)
{
	if (typeof window[func] == 'function')
	{
		return true;
	}
	else
	{
		return false;
	}
}

function logout(var_page)
{
	var tryId = Number(var_page);
	if (isNaN(tryId) || (tryId <= 0)){
		$.get('/index.phtml?client_login_mode=logout', null, function(){
			top.document.location = "/association.phtml?lookup=" + var_page;
		});
		return;
	}

	if (parseInt(var_page) > 0)
	{
		d_number = '&d='+var_page;
	}else
	{
		d_number='';
	}
	var url = get_this_url();
	if(url && (url.indexOf("?") != -1))
	{
//		url = url.substr(0, url.indexOf("?"));
//		document.location = url+"?client_login_mode=logout"+d_number;
		top.document.location = "/index.phtml?client_login_mode=logout"+d_number;
	}
	else // coming from a crystal menu
	{
		top.document.location = "/index.phtml?client_login_mode=logout"+d_number;
	}
}

// Under certain circumstances we need to force the logout
// to happen on the top level of the DOM so that the login
// page isn't presented in an iframe.
function top_logout(var_page)
{
	if (parseInt(var_page) > 0)
	{
		d_number = '&d='+var_page;
	}else
	{
		d_number='';
	}
	var url = get_this_url();
	if(url && (url.indexOf("?") != -1))
	{
		url = url.substr(0, url.indexOf("?"));
		top.document.location = url+"?client_login_mode=logout"+d_number;
	}
	else // coming from a crystal menu
	{
		top.document.location = "/index.phtml?client_login_mode=logout"+d_number;
	}
}

function link_popup_get_logout_page(arg_current_page)
{

	CrLink = window.XshowModalDialog('/classes/editsite/link_popup/link_popup.phtml?type=ft_pages_only&extra=show_associations&from_webpage='+from_webpage, Array(window), 'dialogWidth:30px;dialogHeight:30px;center:yes;status:no;');
	return 1;
}

function link_popup_setup_frg(arg_current_page)
{
	var var_args = arg_current_page.split(",",4);//folderid "hacked into" fileid
	//bit of a hack :-S
	if(var_args[0]=="unpack_frg")
	{
		var_args[0] = var_args[1];
		var_args[1] = var_args[2];
		var_args[2] = var_args[3];
	}
	CrLink = window.XshowModalDialog('/classes/editsite/link_popup/frg_popup.phtml?file_id='+var_args[0]+'&folder_id='+var_args[1]+'&from_webpage='+from_webpage+'&local_files=' + var_args[2], Array(window), 'dialogWidth:30px;dialogHeight:30px;center:yes;status:no;');
	return 1;
}

function link_popup_meta_tag(properties)
{
	var_args = properties.split(",");//folderid "hacked into" fileid
	//still bit of a hack :-@
	//we just are who we are and we are quite proud of who we are [actually]

	if(var_args[0]=="edit_meta")
	{
		var_args[0] = var_args[1];
		var_args[1] = var_args[2];
		var_args[2] = var_args[3];
		var_args[3] = var_args[4];
		var_args[4] = var_args[5];
		var_args[5] = var_args[6];
		var_args[6] = var_args[7];
		var_args[7] = var_args[8];
	}

	if(var_args[6]==undefined)
	{
		var_args[6]='';
	}

	CrLink = window.XshowModalDialog('/classes/editsite/link_popup/meta_tagging.phtml?title='+var_args[1]+'&description='+var_args[2]+'&keywords='+var_args[3]+'&predef='+var_args[4]+'&tag='+var_args[5]+'&tagval='+var_args[6]+'&appendkey='+var_args[7], Array(window), 'dialogWidth:30px;dialogHeight:30px;center:yes;status:no;');
	return 1;
}

function link_popup_del_meta_tag(properties)
{
	var_args = properties.split(",");//folderid "hacked into" fileid
	//i could have just integrated this into meta_tagging.phtml, but i didnt...

	if(var_args[0]=="delete_meta")
	{
		var_args[0] = var_args[1];
		var_args[1] = var_args[2];
		var_args[2] = var_args[3];
		var_args[3] = var_args[4];
		var_args[4] = var_args[5];
		var_args[5] = var_args[6];
	}

	if(var_args[5]==undefined)
	{
		var_args[5]='';
	}

	CrLink = window.XshowModalDialog('/classes/editsite/link_popup/delete_meta_tagging.phtml?title='+var_args[1]+'&description='+var_args[2]+'&keywords='+var_args[3]+'&predef='+var_args[4]+'&tagval='+var_args[5], Array(window), 'dialogWidth:30px;dialogHeight:30px;center:yes;status:no;');
	return 1;
}

function link_popup_get_frogshare(properties)
{
	var args = '';

	var var_args = properties.split(",");
	if (var_args[0] == 'open_frogshare')
	{
		var_args.shift();
	}
	args = var_args[0] + ',' + var_args[1] + ',' + var_args[2] + ',' + var_args[3];

	CrLink =  window.XshowModalDialog('/myfrogtrade/frogshare_choose.phtml?entry_id=' + args + '&link_action=1', Array(window), 'dialogWidth:30px;dialogHeight:30px;center:yes;status:no;');
	return 1;
}

function open_frogshare(properties)
{
	temp_value = properties.split(',');
	var var_extra_location_info = '';
	if (temp_value[1] && (temp_value[1] != 'default'))
	{
		var_extra_location_info = '&dest_type='+temp_value[1]+'&dest_val='+temp_value[2];
	}

	var_location = '/myfrogtrade/frogshare_spoke_openhub.phtml?site_id=' + temp_value[0] + var_extra_location_info;

	if (temp_value[3]=='true')
	{
		window.open(var_location);
	}
	else
	{
		document.location = var_location;
	}
}

function link_popup_page_properties(properties)
{
//	alert(properties);
	var var_args = properties.split(",");//folderid "hacked into" fileid
	//bit of a hack :-S

	if(var_args[0]=="page_properties")
	{
		var_args[0] = var_args[1];
		var_args[1] = var_args[2];
		var_args[2] = var_args[3];
		var_args[3] = var_args[4];
		var_args[4] = var_args[5];
		var_args[5] = var_args[6];
		var_args[6] = var_args[7];
	}

	CrLink = window.XshowModalDialog('/classes/editsite/link_popup/page_properties.phtml?name='+var_args[1]+'&description='+var_args[2]+'&icon='+var_args[3]+'&availability='+var_args[4]+'&template='+var_args[5]+'&permissions='+var_args[6]+'&from_webpage='+from_webpage, Array(window), 'dialogWidth:30px;dialogHeight:30px;center:yes;status:no;');
	return 1;
}

function link_popup_page_userfields(properties)
{
	var var_args = properties.split(",");//folderid "hacked into" fileid
	CrLink = window.XshowModalDialog('/classes/editsite/link_popup/page_userfields.phtml?name='+var_args[1]+'&description='+var_args[2]+'&icon='+var_args[3]+'&availability='+var_args[4]+'&template='+var_args[5]+'&permissions='+var_args[6]+'&from_webpage='+from_webpage, Array(window), 'dialogWidth:30px;dialogHeight:30px;center:yes;status:no;');
	return 1;
}

function link_popup_page_background(properties)
{
	var var_args = properties.split(",");
	CrLink = window.XshowModalDialog('/classes/editsite/link_popup/page_background.phtml?name='+var_args[1]+'&description='+var_args[2]+'&icon='+var_args[3]+'&availability='+var_args[4]+'&template='+var_args[5]+'&permissions='+var_args[6]+'&from_webpage='+from_webpage, Array(window), 'dialogWidth:30px;dialogHeight:30px;center:yes;status:no;');
	return 1;
}

function link_popup_move_page(properties)
{

	var var_args = properties.split(",");

	if(var_args[0]=="create_page")
	{
		var_args[0] = var_args[1];
		var_args[1] = var_args[2];
	}

	CrLink = window.XshowModalDialog('/classes/editsite/link_popup/move_page.phtml?unique_frame_id='+var_args[0]+'&target_folder_id='+var_args[1]+'&from_webpage='+from_webpage, Array(window), 'dialogWidth:30px;dialogHeight:30px;center:yes;status:no;');

	return 1;
}

function link_popup_create_page(properties)
{

	//alert(properties);
	var var_args = properties.split(",");//folderid "hacked into" fileid
	//bit of a hack :-S

	if(var_args[0]=="create_page")
	{
		var_args[0] = var_args[1];
		var_args[1] = var_args[2];
		var_args[2] = var_args[3];
		var_args[3] = var_args[4];
		var_args[4] = var_args[5];
		var_args[5] = var_args[6];
		var_args[6] = var_args[7];
		var_args[7] = var_args[8];
		var_args[8] = var_args[9];
		var_args[9] = var_args[10];
		var_args[10] = var_args[11];
    var_args[11] = var_args[12];
	}

	CrLink = window.XshowModalDialog('/classes/editsite/link_popup/create_page.phtml?name='+var_args[1]+'&description='+var_args[2]+'&icon='+var_args[3]+'&availability='+var_args[4]+'&template='+var_args[5]+'&location='+var_args[6]+'&use_subfolder='+var_args[7]+'&subfolder='+var_args[8]+'&copy_page_id='+var_args[9]+'&retain_access='+var_args[10]+'&from_webpage='+from_webpage, Array(window), 'dialogWidth:30px;dialogHeight:30px;center:yes;status:no;');

	return 1;
}

function link_popup_wf_action(properties)
{
	var var_args = properties.split(",",4);//folderid "hacked into" fileid
	//bit of a hack :-S
	if(var_args[0]=="wf_action")
	{
		var_args[0] = var_args[1];
		var_args[1] = var_args[2];
	}

	CrLink = window.XshowModalDialog('/classes/editsite/link_popup/web_files_action.phtml?wf_name='+var_args[0]+'&wf_action='+var_args[1]+'&from_webpage='+from_webpage, Array(window), 'dialogWidth:30px;dialogHeight:30px;center:yes;status:no;');
	return 1;
}

// Delete a workspace subgroup
function link_popup_delete_workspace_subgroup(properties)
{
  var v = properties.split(",");

  if(v[0] == "delete_workspace_subgroup")
  {
    v.shift();
  }

  var args = '?';

  if(v[0]) { args += 'category=' + v[0] + '&'; }
  if(v[1]) { args += 'cattag=' + v[1] + '&'; }
  if(v[2]) { args += 'usetag=' + v[2]; }

	CrLink = window.XshowModalDialog('/classes/editsite/link_popup/delete_sub_group.phtml'+args, Array(window), 'dialogWidth:30px;dialogHeight:30px;center:yes;status:no;');

  return 1;

}

// Change a workspace subgroup
function link_popup_change_workspace_subgroup(properties)
{
  var v = properties.split(",");

  if(v[0] == "change_workspace_subgroup")
  {
    v.shift();
  }

  var args = '?';

  if(v[0]) { args += 'category=' + v[0] + '&'; }
  if(v[1]) { args += 'cattag=' + v[1] + '&'; }
  if(v[2]) { args += 'usetag=' + v[2]; }

	CrLink = window.XshowModalDialog('/classes/editsite/link_popup/change_sub_group.phtml'+args, Array(window), 'dialogWidth:30px;dialogHeight:30px;center:yes;status:no;');

  return 1;

}

// Create a new workspace subgroup
function link_popup_create_workspace_subgroup(properties)
{
  var v = properties.split(",");

  if(v[0] == "create_workspace_subgroup")
  {
    v.shift();
  }

  var args = '?';

  if(v[0]) { args += 'category=' + v[0] + '&'; }

	CrLink = window.XshowModalDialog('/classes/editsite/link_popup/create_sub_group.phtml'+args, Array(window), 'dialogWidth:30px;dialogHeight:30px;center:yes;status:no;');

  return 1;

}

// Popup to set up the delete workspace link action
function link_popup_delete_workspace(properties)
{
  // Get the tag value to use

  var v = properties.split(",");

  if(v[0] == "delete_workspace")
  {
    v.shift();
  }

  var args = '?';

  if(v[0]) { args += 'workspace_tag=' + v[0] + '&'; }
  if(v[1]) { args += 'pageid=' + v[1] + '&'; }
  if(v[2]) { args += 'name=' + v[2] + '&'; }

	CrLink = window.XshowModalDialog('/classes/editsite/link_popup/delete_workspace.phtml'+args, Array(window), 'dialogWidth:30px;dialogHeight:30px;center:yes;status:no;');

  return 1;
}

//Popup for the create folder link action
function link_popup_create_folder(properties)
{
	var v = properties.split(",");

	if(v[0] == "create_folder")
	{
		//TODO: Change this damn awful system to pass in a javscript object
		//using an array like this is just... Well... Look at it!

		//Pop the 'create_folder' off the beggining
		v.shift();
	}

//Prepare the argument string
	var args = '?';
	if(v[1])
	{
		args += 'folder_description=' 	+ v[1] + '&';
	}
	if(v[2])
	{
		args += 'template=' 						+ v[2] + '&';
	}
	if(v[3])
	{
		args += 'template_id='					+ v[3] + '&';
	}
	if(v[4])
	{
		args += 'custom_icon=' 					+ v[4] + '&';
	}
	if(v[5])
	{
		args += 'custom_icon_filename='	+ v[5] + '&';
	}
	if(v[6])
	{
		args += 'subfolder=' 						+ v[6] + '&';
	}
	if(v[7])
	{
		args += 'collab_enabled=' 			+ v[7] + '&';
	}
	if(v[8])
	{
		args += 'category=' 						+ v[8] + '&';
	}
	if(v[9])
	{
		args += 'copy_of_page_or_frg=' 	+ escape(v[9]) + '&';
	}
	if(v[10])
	{
		args += 'copy_of_id='					 	+ v[10] + '&';
	}
	if(v[11])
	{
		args += 'copy_of_type='				 	+ v[11] + '&';
	}
	if(v[12])
	{
		args += 'access_type=' 		 	+ v[12] + '&';
	}
	if(v[13])
	{
		args += 'admin_permissions=' 		+ v[13] + '&';
	}
  if(v[14])
  {
    args += 'use_groupid=' + v[14] + '&';
  }

	args += '&from_webpage='			+ from_webpage;

	var url = '/classes/editsite/link_popup/create_folder.phtml';
	var dialogOptions = 'dialogWidth:30px;dialogHeight:30px;center:yes;status:no;';

	CrLink = window.XshowModalDialog(url + args, Array(window), dialogOptions);

	return 1;
}

function auto_login(arg_user_info)
{
	var var_user_info_array = arg_user_info.split(':');
	var_user_id = var_user_info_array[0];
	var_hash = var_user_info_array[1];
	var var_location = get_this_url()+"&client_login_mode=login&client_login_id="+var_user_id+"&client_login_hash="+var_hash;
	document.location = var_location;
}

function web_import_users()
{
	var d_args=new Array();
	d_args[0]='/myfrogtrade/import_files.phtml?from_webpage=1';
	return window.XshowModalDialog('/include/dialogContainer.phtml' , d_args , 'dialogHeight:150px;dialogWidth:150px;center:Yes;help:No;resizable:No;status:No;');
}

function web_administer_extra_fields()
{
	var d_args=new Array();
		d_args[0]='/myfrogtrade/udb_fields.phtml?from_webpage=1';
		return window.XshowModalDialog( '/include/dialogContainer.phtml' , d_args , 'dialogHeight:150px;dialogWidth:150px;center:Yes;help:No;resizable:No;status:No;');
}


function gateway_load(arg_gateway_id)
{
	var win = window.open('/myfrogtrade/gateway_open.phtml?gateway_id='+arg_gateway_id,'','resizable=yes, top=10000, left=0, width=10, height=10');
}

var action_array = Array();

action_array['wf_action_title'] = Array('Webfiles','r','r', true);
action_array['wf_action'] = Array('<b>Web Files Action</b>','Sends an action to a named Web Files component','link_popup_wf_action');
action_array['lessons_title'] = Array('Lessons','r','r', true);
action_array['create_lesson,[unique_frame_id]'] = Array('Create a Lesson','Create a lesson using the current page as a resource','');
action_array['open_quick_homework'] = Array('Open Quick Homework','Opens the quick homework creation dialogue','');
action_array['open_quick_issue'] = Array('Open Quick Issue','Opens the quick lesson creation dialogue','');
action_array['live_edi'] = Array('Live@edu','r','r', true);
action_array['live_edu_login'] = Array('Auto Login','Auto Login','');
action_array['live_edu_sky_drive'] = Array('Launch skydrive','Launch skydrive','');
action_array['live_edu_fullclient'] = Array('Launch OWA client','Launch OWA client','');

action_array['google'] = Array('Google','r','r', true);
action_array['google_docs'] = Array('Launch Google Docs','Launch Google Docs','');

action_array['frg_title'] = Array('FRG','r','r', true);
action_array['unpack_frg'] = Array('Unpack FRG File','Unpack a FRG file','link_popup_setup_frg');
action_array['metatagging_title'] = Array('Metatagging','r','r', true);
action_array['edit_meta'] = Array('Edit Metatagging Information','Open a dialog to edit the metatagging information of the current page','link_popup_meta_tag');
action_array['delete_meta'] = Array('Delete Metatagging Information','Open a dialog to delete the metatagging information of the current page','link_popup_del_meta_tag');
action_array['page_actions_title'] = Array('Page Actions','r','r', true);
action_array['create_page'] = Array('Create New Page','Create a new page','link_popup_create_page');
action_array['page_properties'] = Array('Set Page Properties','Open a dialog to set the properties of the current page','link_popup_page_properties');
action_array['page_background,[unique_frame_id]'] = Array('Set Page Background','Open a dialog to set the background of the current page');
action_array['page_userfields,[unique_frame_id]'] = Array('Set Page Userfields','Open a dialog to set the userfields of the current page');
action_array['move_page'] = Array('Move Page','Move a page','link_popup_move_page');
action_array['delete_page,[unique_frame_id]'] = Array('Delete Page','Delete the current page.<br><br>Click on Setup to choose a page to go to when the page is deleted<br><br>If you do not choose a page you may receive an error when the link is used outside of a webfiles component','link_popup_get_delete_refresh_page');
action_array['workspaces_title'] = Array('Workspaces','r','r', true);
action_array['delete_workspace'] = Array('Delete Workspace','Link action to delete a workspace.<br /><br />Please ensure you setup both the type and redirect page using the Setup button below, to avoid unexpected behaviours.','link_popup_delete_workspace');
action_array['workspace_join,[workspace_id]'] = Array('Join Workspace','User request to join current workspace','link_popup_get_delete_refresh_page');
action_array['workspace_leave,[workspace_id]'] = Array('Leave Workspace','Link action to leave current workspace','link_popup_get_delete_refresh_page');
action_array['create_workspace_subgroup'] = Array('Create Workspace Subcategory','Create a new subcategory for workspaces','link_popup_create_workspace_subgroup');
action_array['change_workspace_subgroup'] = Array('Change a Workspace Subcategory','Change a subcategory for workspaces','link_popup_change_workspace_subgroup');
action_array['delete_workspace_subgroup'] = Array('Delete a Workspace Subcategory','Delete a subcategory for workspaces','link_popup_delete_workspace_subgroup');
action_array['dropbox_title'] = Array('Dropboxes','r','r', true);
action_array['delete_dropbox_file,[dropbox_file_id]'] = Array('Delete Dropbox File', 'Deletes a dropbox file in a dropbox widget', '');
action_array['download_dropbox_file,[dropbox_file_id]'] = Array('Download Dropbox File', 'Link to download file from a dropbox','');
action_array['folders_title'] = Array('Folders','r','r', true);
action_array['create_folder,[unique_frame_id]'] = Array('Create New Folder','Open a dialog to create a new folder','link_popup_create_folder');
action_array['delete_folder,[unique_frame_id]'] = Array('Delete Folder','Link action to delete a folder.<br/><br/>Click \'Setup\' to choose a page to load after the folder is deleted','link_popup_get_delete_refresh_page');
action_array['open_functions_title'] = Array('\'Open\' Functions','r','r', true);
action_array['open_avatar_generator'] = Array('Open Avatar Generator','Open the Frog Avatar Generator to allow users to generate a new profile picture.');
action_array['view_pars_report'] = Array('Open PARS Report','View my own/my child\'s PARS Report.');
action_array['gateway_load'] = Array('', '', '');
action_array['open_frogshare'] = Array('Open FrogShare', 'Opens a FrogShare.<br /><br />Click on Setup to choose the FrogShare to load.','link_popup_get_frogshare');
action_array['open_toolkit'] = Array('Open the Toolkit','Opens the login window for the toolkit','');
action_array['user_links_title'] = Array('User Links','r','r', true);
action_array['email_user_teachers'] = Array('Email Teachers','Provides a mailto link to user\'s teachers. Can be used in conjunction with user select brick');
action_array['email_user_parents'] = Array('Email Parents','Provides a mailto link to user\'s parents. Can be used in conjunction with user select brick');
action_array['open_user_preferences'] = Array('Open User Preferences','Opens the User Preferences dialog');
action_array['change_login_page'] = Array('Change Login Page','Link action to change a user\'s login page','link_popup_choose_login_page');
action_array['select_theme,[theme_id]'] = Array('Select theme','Sets a user\'s prefered theme','link_popup_select_theme');
action_array['logout'] = Array('Log Out Webuser','Logs a user out of the website.<br><br>Click on Setup to choose a page to go to when the user logs out.','link_popup_get_logout_page');
///action_array['workspace_invite'] = Array('Invite User to Workspace','Link action to invite a user to this workspace','');
action_array['goto_home_page'] = Array('Go to Home Page','Link action to go to a user\'s home page','');
//	note: the key for the action array is the name of the javascript function
//	        the actual array consists of the display name for the function,
//	        the description of it and the function to run to retrive the arguments from the user

//action_array['web_import_users'] = Array('Import Users','This enables you to import new users into the system.','');
//action_array['web_administer_extra_fields'] = Array('Extra Fields Administration','This enables you to add and remove extra user fields','');

// Fix for modal dialogs. Well, maybe. Let's see if we can break it.

function resize_for_browser()
{
	ua = navigator.userAgent;

	s = 'MSIE';
	if ((i = ua.indexOf(s)) >= 0) // it's IE
	{
		version = parseFloat(ua.substr(i + s.length));
		if(version == 7)
		{
			return 'IE7';
		}
		else
		{ // it might actually be less than IE6, but the point is that IE7 requires adjustments that IE6 and less don't
			return 'IE6';
		}
	}

	s = 'Netscape6/';

	if ((i = ua.indexOf(s)) >= 0)
	{ // similarly, it's not actually Firefox 2, but all NS variants before FF3 have different adjustments to those of IE7 and FF3
		version = parseFloat(ua.substr(i + s.length));
		return 'FF2';
	}

	s = 'Safari';

	if ((i = ua.indexOf(s)) >= 0)
	{
		if(ua.indexOf('Chrome') >= 0)
		{
			return 'Chrome';
		}
		else
		{
			return 'Safari';
		}
	}

	s = 'Gecko';
	if (/Firefox[\/\s](\d+\.\d+)/.test(navigator.userAgent)){ //test for Firefox/x.x or Firefox x.x (ignoring remaining digits);
		var ffversion=new Number(RegExp.$1) // capture x.x portion and store as a number
		
		if (ffversion>=3)
		 return 'FF3'
		else if (ffversion>=2)
		 return 'FF2'
	}

	return 'Other';
}

function XshowModalDialog(url, d_args, features, nativeWindow) {
	if (window.showModalDialog && !nativeWindow) {
		try
		{
			return(window.showModalDialog(url, d_args, features));//prevent js errors when we hit a popup blocker
		}
		catch(err)
		{
			alert('Please disable your popup blocker for this site to continue.');
		}
	} else {
		sFeatures = features.replace(/ /gi,'');
		sURL = url;
		aFeatures = sFeatures.split(";");
		sWinFeat = "directories=0,menubar=0,titlebar=0,toolbar=0,modal=Yes,";
		for ( x in aFeatures )
		{
			aTmp = aFeatures[x].split(":");
			sKey = aTmp[0].toLowerCase();
			sVal = aTmp[1];
			switch (sKey)
			{
				case "dialogheight":
					sWinFeat += "height="+sVal+",";
					pHeight = sVal;
					break;
				case "dialogwidth":
					sWinFeat += "width="+sVal+",";
					pWidth = sVal;
					break;
				case "dialogtop":
					sWinFeat += "screenY="+sVal+",";
					break;
				case "dialogleft":
					sWinFeat += "screenX="+sVal+",";
					break;
				case "resizable":
					sWinFeat += "resizable="+sVal+",";
					break;
				case "status":
					sWinFeat += "status="+sVal+",";
					break;
				case "center":
					if ( sVal.toLowerCase() == "yes" )
					{
						sWinFeat += "center="+sVal+",";
						//sWinFeat += "screenY="+((screen.availHeight-pHeight)/2)+",";
						//sWinFeat += "screenX="+((screen.availWidth-pWidth)/2)+",";
					}
					break;
			}
		}
		modalWin=window.open(String(sURL),"",sWinFeat);
		if (d_args!=null&&d_args!='')
		{
			modalWin.dialogArguments=d_args;
		}
	}
}

/************************************ FireFox Emulating functions ***************************************/

// This is to emulate and be able to use IE only insertAdjacentElement, insertAdjacentHTML and insertAdjacentText functions
if (typeof HTMLElement!='undefined' && !HTMLElement.prototype.insertAdjacentElement)
{
	HTMLElement.prototype.insertAdjacentElement = function(where,parsedNode)
	{
		switch (where)
		{
			case 'BeforeBegin':
				this.parentNode.insertBefore(parsedNode,this)
				break;
			case 'AfterBegin':
				this.insertBefore(parsedNode,this.firstChild);
				break;
			case 'BeforeEnd':
				this.appendChild(parsedNode);
				break;
			case 'AfterEnd':
				if (this.nextSibling)
				{
					this.parentNode.insertBefore(parsedNode,this.nextSibling);
				}
				else
				{
					this.parentNode.appendChild(parsedNode);
				}
				break;
		}
	}

	HTMLElement.prototype.insertAdjacentHTML = function(where,htmlStr)
	{
		var r = this.ownerDocument.createRange();
		r.setStartBefore(this);
		var parsedHTML = r.createContextualFragment(htmlStr);
		this.insertAdjacentElement(where,parsedHTML)
	}

	HTMLElement.prototype.insertAdjacentText = function(where,txtStr)
	{
		var parsedText = document.createTextNode(txtStr)
		this.insertAdjacentElement(where,parsedText)
	}
}

// This is to emulate a document.all for FireFox
function get_document_all()
{
	if (document.all)
	{
		zx_dA = document.all;
	}
	if (!document.all)
	{
		zx_dA = document.getElementsByTagName('body')[0].getElementsByTagName('*');
	}
}

// This is to emulate PHP function 'mktime'
function js_mktime(stringDate)
{
	var myDate = stringDate.split('/');
	newTime = (myDate[2]-1970);
	var yearsBi = Math.floor(newTime/4);
	if ((myDate[2] % 4 == 0) && ((myDate[2] % 100 != 0) || (myDate[2] % 400 == 0))) { var feb = 29; } else { var feb = 28; }
	newTime = (newTime*365)+yearsBi;
	switch (myDate[1])
	{
		case '01':
			break;
		case '02':
			newTime = newTime + 31;
			break;
		case '03':
			newTime = newTime + 31 + feb;
			break;
		case '04':
			newTime = newTime + 31 + feb + 31;
			break;
		case '05':
			newTime = newTime + 31 + feb + 31 + 30;
			break;
		case '06':
			newTime = newTime + 31 + feb + 31 + 30 + 31;
			break;
		case '07':
			newTime = newTime + 31 + feb + 31 + 30 + 31 + 30;
			break;
		case '08':
			newTime = newTime + 31 + feb + 31 + 30 + 31 + 30 + 31;
			break;
		case '09':
			newTime = newTime + 31 + feb + 31 + 30 + 31 + 30 + 31 + 31;
			break;
		case '10':
			newTime = newTime + 31 + feb + 31 + 30 + 31 + 30 + 31 + 31 + 30;
			break;
		case '11':
			newTime = newTime + 31 + feb + 31 + 30 + 31 + 30 + 31 + 31 + 30 + 31;
			break;
		case '12':
			newTime = newTime + 31 + feb + 31 + 30 + 31 + 30 + 31 + 31 + 30 + 31 + 30;
			break;
	}
	newTime = (newTime + (myDate[0] - 1)) * 86400;
	return newTime;
}

function findPos(o, outlinemode)
{
	if(outlinemode && o.tagName == 'BODY')
	{
		// top document needs it's own bits and bobs.
//alert(o.offsetHeight);
		if (o.scrollHeight > o.offsetHeight)
		{
			var height = o.scrollHeight;
		}
		else
		{
			var height = o.offsetHeight;
		}
		return [2, 2, o.offsetWidth-23 , height-16];
	}

    var fixBrowserQuirks = true;
      // If a string is passed in instead of an object ref, resolve it
    if (typeof(o)=="string") {
      o = resolveObject(o);
    }

    if (o==null) {
      return null;
    }

    var left = 0;
    var top = 0;
    var width = 0;
    var height = 0;
    var parentNode = null;
    var offsetParent = null;


    offsetParent = o.offsetParent;
    var originalObject = o;

    var el = o; // "el" will be nodes as we walk up, "o" will be saved for offsetParent references
    while ((el.parentNode!=null))
	{
/*
		if ((el.parentNode==null))
		{
			alert('jumping up a parent!');
			parentiframes = parent.document.getElementsByTagName('IFRAME');
			for (var i = 0; i < parentiframes.length; i++)
			{
				alert(parentiframes[i].location.href);
			}
			el = el.parentNode;
		}
		else
		{
		//	alert('no need to jump');
			el = el.parentNode;
		}
*/

//alert(el.tagName + ':' + el.id);
/*
el.style.borderStyle="solid";
el.style.borderWidth="1px";
el.style.borderColor="#ff0000";
*/

      el = el.parentNode;
      if (el.offsetParent==null) {
      }
      else {
        var considerScroll = true;
        /*
        In Opera, if parentNode of the first object is scrollable, then offsetLeft/offsetTop already
        take its scroll position into account. If elements further up the chain are scrollable, their
        scroll offsets still need to be added in. And for some reason, TR nodes have a scrolltop value
        which must be ignored.
        */
        if (fixBrowserQuirks && window.opera) {
          if (el==originalObject.parentNode || el.nodeName=="TR") {
            considerScroll = false;
          }
        }

		// ---
		// This bit needed to correct positioning when an editable area is within a scroll frame
		// which has been partially scrolled.
		if (o.tagName == 'IFRAME')
		{
			if (o.contentWindow.document.body.firstChild.id != div_id)
			{
				top -= o.contentWindow.document.body.scrollTop;
			}
		}
		// ---

        if (considerScroll) {
          if (el.scrollTop && el.scrollTop>0) {
            top -= el.scrollTop;
          }
          if (el.scrollLeft && el.scrollLeft>0) {
            left -= el.scrollLeft;
          }
        }
      }
      // If this node is also the offsetParent, add on the offsets and reset to the new offsetParent
      if (el == offsetParent) {
        left += o.offsetLeft;
        if (el.clientLeft && el.nodeName!="TABLE") {
          left += el.clientLeft;
        }
        top += o.offsetTop;
        if (el.clientTop && el.nodeName!="TABLE") {
          top += el.clientTop;
        }
        o = el;
        if (o.offsetParent==null) {
          if (o.offsetLeft) {
            left += o.offsetLeft;
          }
          if (o.offsetTop) {
            top += o.offsetTop;
          }
        }
        offsetParent = o.offsetParent;
      }
    }


    if (originalObject.offsetWidth) {
      width = originalObject.offsetWidth;
    }
    if (originalObject.offsetHeight) {
      height = originalObject.offsetHeight;
    }

//alert('My last element type was: '+o.tagName+':'+o.id);

   return [left, top, width, height];
    //return {'left':left, 'top':top, 'width':width, 'height':height
        //};
  }

function get_top_window(prev_window)
{
	var ret;

	if (prev_window.parent != prev_window)
	{
		try
		{
			ret = get_top_window(prev_window.parent);
		}
		catch(e)
		{
			ret = prev_window;
		}

	}
	else
	{
		ret = prev_window;
	}

	//unless you access this property the script returns a permission denied when in a cross domain frame
	insane_magic_variable=prev_window.location.search;

	return ret;
}

function resizeDialog(dialog_type)
{
	if(window.parent.showDialogContainer)
	{
		window.parent.showDialogContainer();
	}

	if(dialog_type == 'link_popup')
	{
		var page_container = document.getElementById('createLink');
	}
	else
	{
		var page_container = document.getElementById('pageContainer');
	}

	heightadjust = 0;
	widthadjust = 0;

	var browser = resize_for_browser();

	if(dialog_type)
	{
		if(browser == 'FF3')
		{
			heightadjust = 85;
			widthadjust = 10;
		}
		else if(browser == 'FF2')
		{
			heightadjust = 85;
			widthadjust = 10;
		}
		else if(browser == 'IE6')
		{
			heightadjust = 55;
			widthadjust = 10;
		}
		else if(browser == 'Chrome')
		{
			heightadjust = 65;
			widthadjust = 25;
		}
		else if(browser == 'Safari')
		{
			heightadjust = 50;
			widthadjust = 20;
		}
	}

	if(dialog_type == 'dialog_box')
	{
        var max_container_height = parseInt(screen.height) - 200;
		// signposts dialog gets borked: can't think why at the moment
		var additional_width = (document.getElementById('associations') != null ? 80 : 0);
		page_container.style.width = (document.getElementById('ext_table').offsetWidth + additional_width) + 'px';

        if (document.getElementById('ext_table').offsetHeight > max_container_height) {
            page_container.style.height = max_container_height;
            page_container.style.overflowY = 'hidden';
            page_container.style.overflowX = 'hidden';
            $content_container = $('div.main_content_container');
            $content_container.css('height',max_container_height-100);
            if (document.all) {
                page_container.style.width = (parseInt(page_container.style.width)+25)+'px';
            }
        } else {
            page_container.style.height = document.getElementById('ext_table').offsetHeight + 'px';
        }
	}

	var new_width = page_container.offsetWidth;
	var tmp = parseInt(page_container.style.marginLeft);
	new_width += (isNaN(tmp) ? 0 : tmp);
	tmp = parseInt(page_container.style.marginRight);
	new_width += (isNaN(tmp) ? 0 : tmp);

	var new_height = page_container.offsetHeight;
	var tmp = parseInt(page_container.style.marginTop);
	new_height += (isNaN(tmp) ? 0 : tmp);
	tmp = parseInt(page_container.style.marginBottom);
	new_height += (isNaN(tmp) ? 0 : tmp);

	if(new_height > screen.availHeight) {
		new_height = screen.availHeight;
	}
	if(new_width > screen.width) {
		new_width = screen.width;
	}
	if(dialog_type == 'tabbed_dialog'){
		var $content_container = $('div.tb_dialog_mainContainer');
		var $mid_container = $('div.tb_dialog_midContainer');
		var $page_container = $('#pageContainer');

		var content_container_height = parseInt($content_container.height());
		var page_container_height = parseInt($page_container.height());

		var delta = page_container_height - screen.availHeight + 100;
		var mid_container_height = parseInt($mid_container.height());

		if (delta > 0){
			$mid_container.css('height',mid_container_height-delta);
			$content_container.css('height',content_container_height-delta);
		}

		var page_container_width = parseInt($page_container.width());
		var content_container_width = parseInt($content_container.width());

		var delta_w = page_container_width - screen.width + 20;
		if(delta_w > 0){ 
			$content_container.css('width',content_container_width-delta_w);
			$page_container.css('width',page_container_width-delta_w);
		}
	}
	var new_top = (screen.height-new_height) / 2;
	var new_left = (screen.width-new_width) / 2;

	if(browser == 'Chrome')
	{
		var startXPos=window.screenX;
		var startYPos=window.screenY;

		if(startXPos!=new_left||startYPos!=new_top)
		{
			top.moveTo(new_left, new_top);

			//This was added to wait for window to move before resizing it, this is to stop unexpected results in Chrome
			while(window.screenX==startXPos&&window.screenY==startYPos) //While this window has not moved, loop
			{
				continue;
			}
		}

		window.resizeTo((new_width + widthadjust), (new_height + heightadjust));
	}
	else
	{
        var doresize = function() {
            parent.resizeTo((new_width + widthadjust), (new_height + heightadjust));
            parent.moveTo (new_left, new_top);

            parent.dialogWidth= (new_width + widthadjust) + 'px';
            parent.dialogHeight= (new_height + heightadjust) + 'px';
            parent.dialogTop= new_top + 'px';
            parent.dialogLeft= new_left + 'px';
        };

        var resizechecker = window.setInterval(function() {
            try {
                doresize();
                clearInterval(resizechecker);
            } catch(error) {
                // try again if resize has failed (error.description will be "Access is denied.")
            }
        }, 1);
	}

	document.body.style.margin='0px';
	document.body.style.border='none';
	document.body.style.backgroundColor='#fff';
	if(page_container.offsetHeight > 200)
	{
		document.body.style.backgroundPosition='center';
	}
	else
	{
		document.body.style.backgroundPositionY='30%';
	}
	document.body.background='/sysimages/dialogs/dialog_background.gif';
}

////////////////////////////////////////
// Some functions from direct_edit.phtml
function get_qe_top(element)
{
	if(element.offsetTop != 0)
	{
		div_top = element.offsetTop;
	}
	while (element.parentNode)
	{
	//	alert(":"+element.parentNode.tagName);
	//	element.parentNode.style.borderStyle="solid";
	//	element.parentNode.style.borderWidth="2px";

	/*alert (element.parentNode.getAttribute("cellspacing"))
	{
		alert(element.parentNode.getAttribute("cellspacing"));
	}*/

		if(element.className == "frog_scroller_class")
		{
			//alert("Scroll Frame Found: " + element.id);
			//alert(findPos(element.offsetParent));
			div_top = div_top + findPos(element.offsetParent)[1];
			//alert("div_top is now:"+div_top);

		}
	/*
	if (element.offsetTop)
	{
		div_top+= parseInt(element.offsetTop);
	}
	*/
	/*
	if (element.parentNode.offsetTop)
	{
		div_top+= parseInt(element.parentNode.offsetTop);
	}
	*/
		if (element.parentNode.tagName=="TABLE" && element.parentNode.getAttribute("cellspacing"))
		{
			div_top = div_top - (1 * element.parentNode.getAttribute("cellspacing"));
		}
		element = element.parentNode;
	}
	//alert("final div_top is "+div_top);
	return div_top;
}
function get_qe_left(element)
{
	if(element.offsetLeft != 0)
	{
		div_left = element.offsetLeft;
	}

	while (element.parentNode)
	{
		if(element.className == "frog_scroller_class")
		{
			//alert("Scroll Frame Found: " + element.id);
			//alert(findPos(element.offsetParent));
			div_left = div_left + findPos(element.offsetParent)[0];
		}
		if (element.parentNode.tagName=="TABLE" && element.parentNode.getAttribute("cellspacing"))
		{
			div_left = div_left - (1 * element.parentNode.getAttribute("cellspacing"));
		}
		element = element.parentNode;
	}
	//alert("final div_left is "+div_left);
	return div_left;
}

//Function to get Nested Page Components positions and sizes
function get_qe_nested(element)
{
	var obj = document.getElementById(element);
	div_top = get_qe_top(obj);
	div_left = get_qe_left(obj);
	div_width = obj.offsetWidth + 15;
	div_height = obj.offsetHeight;

	if (obj.offsetHeight < 300)
	{
		obj.style.height="300px";
		div_height=300;
	}
	if (obj.offsetWidth < 50)
	{
		obj.style.width="50px";
		div_width=50;
	}
	return div_top+":"+div_left+":"+div_width+":"+div_height;
}

//Function to get the Width and Height of the Document containing the iFrames or Nested Pages
function get_qe_docsize(nested)
{
	if (nested == 1)
	{
		var hr = top.get_this_url();
	}
	else
	{
		var hr = parent.document.location.href;
		var hr = top.get_this_url();
	}
	var pieces = hr.split("=");

	if(pieces.length <= 1)
	{
		var hr = top.get_this_url();
		var pieces = hr.split("=");

	}
	var arguments = pieces[1].split("&");
	var ss = top.document.getElementById("ajax_qe_"+arguments[0]+"_1");

	if (window.innerHeight)
	{
		// Mozilla
		var window_height = window.innerHeight;
	}
	else
	{
		// IE
		var window_height = document.body.offsetHeight;
	}

	if (window_height > ss.offsetHeight)
	{
		grey_height = (window_height*1) - 55;
	}
	else
	{
		grey_height = ss.offsetHeight;
	}
	return ss.offsetWidth+":"+grey_height;
}

// End functions from direct_edit.phtml
////////////////////////////////////////

// Prototype alias for getElementsByClassName.  Have a guess why.
function $$(className, tag, elm)
{
	var testClass = new RegExp("(^|\\s)" + className + "(\\s|$)");
	var tag = tag || "*";
	var elm = elm || document;
	var elements = (tag == "*" && elm.all)? elm.all : elm.getElementsByTagName(tag);
	var returnElements = [];
	var current;
	var length = elements.length;
	for(var i=0; i<length; i++)
	{
		current = elements[i];
		if(testClass.test(current.className))
		{
			returnElements.push(current);
		}
	}
	return returnElements;
}
function manipulate_edit_links(hide_or_show)
{
	$('a.edit_link, a.fs_edit_link, top.document > a.edit_link, top.document > a.fs_edit_link').css('display', hide_or_show?'block':'none');
}

function qe_login(document_id, uoe)
{
	window.open("index.phtml?d=" + document_id + "&de=" + document_id + "&uoe=" + uoe);
}

function get_url_variables()
{
    var map = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
        map[key] = value.replace('#','');
    });
    return map; 
}
