// This fix is to ensure nested draggables work in IE - it's a bug in jQuery itself
$.extend($.ui.draggable.prototype, (function (orig) {
  return {
    _mouseCapture: function (event) {
      var result = orig.call(this, event);
      if (result && $.browser.msie) event.stopPropagation();
      return result;
    }
  };
})($.ui.draggable.prototype["_mouseCapture"]));
// End jQuery fix

// This fix is to ensure droppable areas can be dragged - a bug in IE means that offsetParent and getBoundingClientRect are unreliable with dynamic content
function IESafeOffsetParent(elem) {
    try {
       return elem.offsetParent;
    } catch(e) {        
      return document.body;
    }
}

jQuery.fn.offset = function() {
	var left = 0, top = 0, elem = this[0], results;
	if ( elem ) with ( jQuery.browser ) {
        var parent         = elem.parentNode,
            offsetChild    = elem,
            offsetParent   = IESafeOffsetParent(elem),
            doc            = elem.ownerDocument,
            safari2        = typeof safari !== 'undefined' && safari && parseInt(version) < 522 && !/adobeair/i.test(userAgent),
            css            = jQuery.curCSS,
            fixed          = css(elem, "position") == "fixed";

        // Use getBoundingClientRect if available
        if (false && elem.getBoundingClientRect) {
            var box = elem.getBoundingClientRect();

		// Add the document scroll offsets
		add(box.left + Math.max(doc.documentElement.scrollLeft, doc.body.scrollLeft),
			box.top  + Math.max(doc.documentElement.scrollTop,  doc.body.scrollTop));

		// IE adds the HTML element's border, by default it is medium which is 2px
		// IE 6 and 7 quirks mode the border width is overwritable by the following css html { border: 0; }
		// IE 7 standards mode, the border is always 2px
		// This border/offset is typically represented by the clientLeft and clientTop properties
		// However, in IE6 and 7 quirks mode the clientLeft and clientTop properties are not updated when overwriting it via CSS
		// Therefore this method will be off by 2px in IE while in quirksmode
		add( -doc.documentElement.clientLeft, -doc.documentElement.clientTop );

        // Otherwise loop through the offsetParents and parentNodes
		} else {
			// Initial element offsets
			add( elem.offsetLeft, elem.offsetTop );

			// Get parent offsets
			while ( offsetParent ) {
				// Add offsetParent offsets
				add( offsetParent.offsetLeft, offsetParent.offsetTop );

				// Mozilla and Safari > 2 does not include the border on offset parents
				// However Mozilla adds the border for table or table cells
				if ( typeof mozilla !== 'undefined' && mozilla && !/^t(able|d|h)$/i.test(offsetParent.tagName) || typeof safari !== 'undefined' && safari && !safari2 )
					border( offsetParent );

				// Add the document scroll offsets if position is fixed on any offsetParent
				if ( !fixed && css(offsetParent, "position") == "fixed" )
					fixed = true;

				// Set offsetChild to previous offsetParent unless it is the body element
				offsetChild  = /^body$/i.test(offsetParent.tagName) ? offsetChild : offsetParent;
				// Get next offsetParent
				offsetParent = offsetParent.offsetParent;
			}

			// Get parent scroll offsets
			while ( parent && parent.tagName && !/^body|html$/i.test(parent.tagName) ) {
				// Remove parent scroll UNLESS that parent is inline or a table to work around Opera inline/table scrollLeft/Top bug
				if ( !/^inline|table.*$/i.test(css(parent, "display")) )
					// Subtract parent scroll offsets
					add( -parent.scrollLeft, -parent.scrollTop );

				// Mozilla does not add the border for a parent that has overflow != visible
				if ( typeof mozilla !== 'undefined' && mozilla && css(parent, "overflow") != "visible" )
					border( parent );

				// Get next parent
				parent = parent.parentNode;
			}

			// Safari <= 2 doubles body offsets with a fixed position element/offsetParent or absolutely positioned offsetChild
			// Mozilla doubles body offsets with a non-absolutely positioned offsetChild
			if ( (safari2 && (fixed || css(offsetChild, "position") == "absolute")) ||
					(typeof mozilla !== 'undefined' && mozilla && css(offsetChild, "position") != "absolute") )
							add( -doc.body.offsetLeft, -doc.body.offsetTop );

			// Add the document scroll offsets if position is fixed
			if ( fixed )
					add(Math.max(doc.documentElement.scrollLeft, doc.body.scrollLeft),
							Math.max(doc.documentElement.scrollTop,  doc.body.scrollTop));
		}

		// Return an object with top and left properties
		results = { top: top, left: left };
	}

	function border(elem) {
		add( jQuery.curCSS(elem, "borderLeftWidth", true), jQuery.curCSS(elem, "borderTopWidth", true) );
	}

	function add(l, t) {
		left += parseInt(l, 10) || 0;
		top += parseInt(t, 10) || 0;
	}

return results;
};
// End jQuery fix