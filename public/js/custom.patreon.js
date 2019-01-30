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
/*
     FILE ARCHIVED ON 07:20:19 Nov 30, 2018 AND RETRIEVED FROM THE
     INTERNET ARCHIVE ON 03:14:38 Jan 30, 2019.
     JAVASCRIPT APPENDED BY WAYBACK MACHINE, COPYRIGHT INTERNET ARCHIVE.

     ALL OTHER CONTENT MAY ALSO BE PROTECTED BY COPYRIGHT (17 U.S.C.
     SECTION 108(a)(3)).
*/
/*
playback timings (ms):
  LoadShardBlock: 167.522 (3)
  esindex: 0.005
  captures_list: 188.562
  CDXLines.iter: 12.52 (3)
  PetaboxLoader3.datanode: 134.07 (5)
  exclusion.robots: 0.197
  exclusion.robots.policy: 0.181
  RedisCDXSource: 4.884
  PetaboxLoader3.resolve: 132.962 (3)
  load_resource: 106.979
*/