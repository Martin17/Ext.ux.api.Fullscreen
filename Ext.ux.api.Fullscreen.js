/**
 * Plugin for Ext components that add standarized support for the fullscreen API. 
 * Work with all modern browsers.
 * Components that have floating children do not work properly. 
 * This happens because these children are not children of the component in the DOM tree.
 * Based on http://johndyer.name/native-fullscreen-javascript-api-plus-jquery-plugin/
 * @author Martín Panizzo <martin@fotolounge.com.ar>
 * @version 0.1-alpha
 */
Ext.define('Ext.ux.api.Fullscreen', {
    alias : 'plugin.fullscreen',
    extend : 'Ext.AbstractPlugin',
    pluginId : 'fullscreenapi',
    mixins : {
        observable : 'Ext.util.Observable'
    },
    /**
	 * @private Browser Support for fullscreen api
	 */
    supportsFullScreen : false,
    /**
	 * @cfg {Boolean} lockedFullScreen Lock fullscreen api
	 */
    lockedFullScreen : false,
    /**
	 * Check if element is fullscreen
	 * 
	 * @return {Boolean}
	 */
    isFullScreen : function() {
        return false;
    },
    /**
	 * @private Api ready
	 */
    apiReady : false,
    /**
	 * @private Request fullscreen
	 */
    requestFullScreen : Ext.emptyFn,
    /**
	 * @private Cancel fullscreen
	 */
    cancelFullScreen : Ext.emptyFn,
    /**
	 * @private Toggle fullscreen
	 */
    toggleFullScreen : Ext.emptyFn,
    /**
	 * @private Current fullscreen API event name
	 */
    fullScreenEventName : '',
    /**
	 * @private Current browser prefix
	 */
    prefix : '',
    /**
	 * @private Browsers prefix
	 */
    browserPrefixes : ['webkit', 'moz', 'o', 'ms', 'khtml'],
    /**
	 * Check if browser support fullscreen and set {@link #prefix} and
	 * {@link #supportsFullScreen}
	 */
    constructor : function() {
        this.callParent(arguments);
        var me = this;
        if (typeof document.cancelFullScreen != 'undefined') {
            me.supportsFullScreen = true;
        } else {
            // check for fullscreen support by vendor prefix
            for (var i = 0, il = me.browserPrefixes.length; i < il; i++) {
                me.prefix = me.browserPrefixes[i];

                if (typeof document[me.prefix + 'CancelFullScreen'] != 'undefined') {
                    me.supportsFullScreen = true;

                    break;
                }
            }
        }
    // me.mixins.observable.constructor.call(me);
    },
    /**
	 * Add fullscreen API to the component DOM element and set
	 * {@link #requestFullScreen} , {@link #cancelFullScreen} and
	 * {@link #toggleFullScreen}
	 */
    init : function(cmp) {
        this.callParent(arguments);
        var me = this;
        if (me.supportsFullScreen) {
            me.fullScreenEventName = me.prefix + 'fullscreenchange';
            me.isFullScreen = function() {
                switch (me.prefix) {
                    case '' :
                        return document.fullScreen;
                    case 'webkit' :
                        return document.webkitIsFullScreen;
                    default :
                        return document[me.prefix + 'FullScreen'];
                }
            }
            cmp.on('render', function() {
                if (!me.apiReady) {
                    cmp.requestFullScreen = function() {
                        if (me.lockedFullScreen) {
                            me.fireEvent('lockedfullscreen', me
                                .getCmp(), me.prefix);
                            return;
                        }
                        var el = cmp.getEl().dom;
                      //  console.log(cmp.getEl());
                        me.fireEvent('requestfullscreen', me.getCmp(),
                            me.prefix);
                        return (me.prefix === '') ? el
                        .requestFullScreen() : el[me.prefix
                        + 'RequestFullScreen']();
                    };
                    cmp.cancelFullScreen = function() {
                        if (me.lockedFullScreen) {
                            me.fireEvent('lockedfullscreen', me
                                .getCmp(), me.prefix);
                            return;
                        }
                        var el = cmp.getEl().dom;
                        me.fireEvent('cancelfullscreen', me.getCmp(),
                            me.prefix);
                        return (me.prefix === '')
                        ? document.cancelFullScreen()
                        : document[me.prefix
                        + 'CancelFullScreen']();
                    }
                    cmp.toggleFullScreen = function() {
                        (me.isFullScreen())
                        ? cmp.cancelFullScreen()
                        : cmp.requestFullScreen();
                    }
                    me.apiReady = true;
                }
            });
        }
    },
    enable : function() {
        var me = this;
        me.lockedFullScreen = false;
       // me.callParent();
    },

    disable : function() {
        var me = this;
        me.lockedFullScreen = true;
       // me.callParent();
    }

});
