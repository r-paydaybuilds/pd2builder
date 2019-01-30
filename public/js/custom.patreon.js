var Patreon    = {

    _init:      function ()
                {
                    var _cookie = document.cookie.match( new RegExp( '(?:^|;\\s*)patreon=([^;]*)') );

                    if ( !_cookie || _cookie[ 1 ] != 1 )
                    {
                        $( '#patreon' ).modal( 'show' );

                        document.cookie = 'patreon=1; expires=Tuesday, January 1, 2019 at 00:00:00 AM; path=/';
                    }
                }

};

$( Patreon._init );