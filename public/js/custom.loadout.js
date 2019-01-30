var Skills          = {

    costSkill:      [],
    costTier:       [],
    pointsSubtree:  [],
    pointsTotal:    0,
    selected:       [],

    _eventAdd:      function ( e )
    {
        var _elem   = $( e.target );

        var _skill  = _elem.data( "id" );
        var _ul     = _elem.parent();

        if ( !_ul.hasClass( "sk_locked" ) && !_ul.hasClass( "sk_aced" ) )
        {
            Skills._skillAdd( _skill, false );
        }
    },

    _eventInit:     function ()
    {
        $( "a[href^=#tab_sk_]" ).each( function ()
        {
            var _tree = $( this ).attr( "href" ).replace( "#tab_sk_", "" );

            $( "#sk_" + _tree + "_container" ).find( ".sk_subtree" ).each( function ()
            {
                var _subtree = $( this ).attr( "id" );

                Skills.pointsSubtree[ _subtree ] = 0;
                Skills._subtreeUpdate( _subtree );
            } );
        } );

        $( ".sk_tier_cost_0,.sk_tiers_cost_0" ).html( ( "00" + Skills.costTier[ 0 ] ).slice( -3 ) );
        $( ".sk_tier_cost_1,.sk_tiers_cost_1" ).html( ( "00" + Skills.costTier[ 1 ] ).slice( -3 ) );
        $( ".sk_tier_cost_2,.sk_tiers_cost_2" ).html( ( "00" + Skills.costTier[ 2 ] ).slice( -3 ) );
        $( ".sk_tier_cost_3,.sk_tiers_cost_3" ).html( ( "00" + Skills.costTier[ 3 ] ).slice( -3 ) );

        $( "#sk_points_total" ).html( Skills.pointsTotal );

        $( ".sk_details" ).css( "height", $( ".sk_container" ).first().height() - 84 );

        for ( var _i_ = 0, _l_ = Skills.selected.length; _i_ < _l_; _i_++ )
        {
            Skills._skillAdd( Skills.selected[ _i_ ].replace( "_basic", "" ).replace( "_aced", "" ), true );
        }

        $( ".sk_subtree" ).each( function ()
        {
            Skills._subtreeUpdate( $( this ).attr( "id" ) );
        } );
    },

    _eventRefund:   function ()
    {
        var _tree = $( "#" + $( "#skills" ).find( "ul li.active a" ).attr( "href" ).replace( "#", "" ) );

        var _sk_list_ = Skills.selected.slice( 0 );

        for ( var _i_ = 0, _l_ = _sk_list_.length; _i_ < _l_; _i_++ )
        {
            var _skill = _sk_list_[ _i_ ].replace( "_basic", "" ).replace( "_aced", "" );

            if ( _tree.find( "li[data-id=\"" + _skill + "\"]" ).length )
            {
                Skills._skillRemove( _skill, true );
            }
        }

        _tree.find( ".sk_subtree" ).each( function ()
        {
            Skills._subtreeUpdate( $( this ).attr( "id" ) );
        } );
    },

    _eventRemove:   function ( e )
    {
        var _elem   = $( e.target );

        var _skill  = _elem.data( "id" );
        var _ul     = _elem.parent();

        if ( !_ul.hasClass( "sk_locked" ) && ( _ul.hasClass( "sk_basic" ) || _ul.hasClass( "sk_aced" ) ) )
        {
            var _state   = _ul.hasClass( "sk_aced" ) ? "aced" : "basic";
            var _subtree = _ul.closest( ".sk_subtree" ).attr( "id" );
            var _tier    = _ul.parent().attr( "id" ).split( "_" ).slice( -2, -1 )[ 0 ];

            var _points  = ( _state == "basic" ? Skills.costSkill[ _tier ][ 0 ] : Skills.costSkill[ _tier ][ 1 ] );
            var _points_ = Skills.pointsSubtree[ _subtree ] - _points;
            var _deduct  = 0;

            for ( var _i_ = Skills.costTier.length; _i_ > 0; --_i_ )
            {
                var _active = false;

                var _subtrees = $( "#" + _subtree + "_" + _i_ );

                $( _subtrees ).find( ".sk_basic" ).each( function ()
                {
                    if ( $( this ).find( "li" ).data( "id" ) != _skill )
                    {
                        _active = true;
                        _deduct += Skills.costSkill[ _i_ ][ 0 ];
                    }
                } );

                $( _subtrees ).find( ".sk_aced" ).each( function ()
                {
                    if ( $( this ).find( "li" ).data( "id" ) != _skill )
                    {
                        _active = true;
                        _deduct += Skills.costSkill[ _i_ ][ 1 ];
                    }
                } );

                if ( _active && ( _points_ - _deduct ) < Skills.costTier[ _i_ ] )
                {
                    return false;
                }
            }

            Skills._skillRemove( _skill, false );
        }

        return false;
    },

    _skillAdd:      function ( skill, init )
    {
        var _ul         = $( "li[data-id=\"" + skill + "\"]" ).parent();

        var _state      = _ul.hasClass( "sk_basic" ) ? "aced" : "basic";
        var _subtree    = _ul.closest( ".sk_subtree" ).attr( "id" );
        var _tier       = _ul.parent().attr( "id" ).split( "_" ).slice( -2, -1 )[ 0 ];

        var _points     = ( _state == "basic" ? Skills.costSkill[ _tier ][ 0 ] : Skills.costSkill[ _tier ][ 1 ] );

        if ( Skills.pointsTotal >= _points )
        {
            Skills.pointsSubtree[ _subtree ] += _points;
            Skills.pointsTotal -= _points;

            if ( Skills.pointsTotal == 0 )
            {
                $( ".sk_points" ).addClass( "color_negative" );
            }

            if ( !init )
            {
                Skills.selected.push( skill + "_" + _state );
                Skills._subtreeUpdate( _subtree );
                Loadout._eventChangeSkill( true, skill, _state );
            }

            _ul.addClass( "sk_" + _state );
        }
    },

    _skillRemove:   function ( skill, refund )
    {
        var _ul         = $( "li[data-id=\"" + skill + "\"]" ).parent();

        var _state      = _ul.hasClass( "sk_aced" ) ? "aced" : "basic";
        var _subtree    = _ul.closest( ".sk_subtree" ).attr( "id" );
        var _tier       = _ul.parent().attr( "id" ).split( "_" ).slice( -2, -1 )[ 0 ];
        var _points     = ( _state == "basic" ? Skills.costSkill[ _tier ][ 0 ] : Skills.costSkill[ _tier ][ 1 ] );

        Skills.pointsSubtree[ _subtree ] -= _points;
        Skills.pointsTotal += _points;

        if ( Skills.pointsTotal > 0 )
        {
            $( ".sk_points" ).removeClass( "color_negative" );
        }

        Skills.selected.splice( Skills.selected.indexOf( skill + "_" + _state ), 1 );

        _ul.removeClass( "sk_" + _state );

        if ( !refund )
        {
            Skills._subtreeUpdate( _subtree );
        }

        Loadout._eventChangeSkill( false, skill, _state );
    },

    _subtreeUpdate: function ( subtree )
    {
        var _progress = 0;
        var _floor    = 0;
        var _points   = Skills.pointsSubtree[ subtree ];

        for ( var _i_ = 0, _l_ = Skills.costTier.length; _i_ < _l_; _i_++ )
        {
            var _tier = $( "#" + subtree + "_" + _i_ );

            _floor = Skills.costTier[ _i_ ] - _floor;

            if ( _points >= _floor )
            {
                _progress += 25;
                _points -= _floor;
                _floor = Skills.costTier[ _i_ ];

                _tier.find( "ul" ).removeClass( "sk_locked" );
            }
            else
            {
                _progress += ( _points / this.costTier[ _i_ ] ) * 25;

                _tier.find( "ul" ).addClass( "sk_locked" );
            }

            var _cost = Skills.costTier[ _i_ ] - Skills.pointsSubtree[ subtree ];
            _cost     = ( _cost > 0 ? _cost : 0 );

            _tier.find( ".sk_tier_cost_" + _i_ ).html( ( "00" + _cost ).slice( -3 ) );
        }

        $( "#" + subtree ).css( "background-size", "99% " + Math.round( _progress ) + "%" );

        $( ".sk_points_total" ).html( Skills.pointsTotal );
    }

};

var Perks           = {

    target:             false,

    _eventHoverOff:     function ()
    {
        var _selected = $( ".pk_selected" ).data( "id" );

        Perks.target = _selected ? _selected : $( ".pk_item" ).first().data( "id" );
        Perks._updateDetails();
    },

    _eventHoverOn:      function ( e )
    {
        Perks.target = $( e.currentTarget ).data( "id" );
        Perks._updateDetails();
    },

    _eventInit:         function ()
    {
        Perks._updateSelection();
        Perks._eventHoverOff();
    },

    _eventSelectOff:    function ( e )
    {
        var _elem = $( e.currentTarget );

        if ( _elem.hasClass( "pk_selected" ) )
        {
            _elem.removeClass( "pk_selected" );
            Perks._updateSelection();

            Loadout._eventChangePerk( false, _elem.data( "id" ) );
        }

        return false;
    },

    _eventSelectOn:     function ( e )
    {
        var _elem = $( e.currentTarget );

        if ( _elem.hasClass( "pk_locked" ) )
        {
            return;
        }

        var _selected = $( ".pk_selected" );

        if ( _selected.data( "id" ) == _elem.data( "id" ) )
        {
            _elem.removeClass( "pk_selected" );

            Loadout._eventChangePerk( false, _elem.data( "id" ) );
        }
        else
        {
            _selected.removeClass( "pk_selected" );
            _elem.addClass( "pk_selected" );

            Loadout._eventChangePerk( true, _elem.data( "id" ) );
        }

        Perks._updateSelection();
    },

    _updateDetails:     function ()
    {
        var _elem =  $( "[data-id=\"" + Perks.target + "\"]" );

        var _details = $( "#pk_details" );

        _details.html( _elem.data( "details" ) );

        if ( _elem.hasClass( "pk_locked" ) )
        {
            _details.append( _elem.data( "locked" ) );
        }
    },

    _updateSelection:   function ()
    {
        var _selected = $( ".pk_selected" ).length;

        $( ".pk_item" ).each( function ()
        {
            var _item = $( this );

            if ( !_item.hasClass( "pk_locked" ) )
            {
                if ( _item.hasClass( "pk_selected" ) || !_selected )
                {
                    _item.css( "opacity", 1 );
                }
                else
                {
                    _item.css( "opacity", 0.2 );
                }
            }
            else
            {
                _item.css( "opacity", 0.1 );
            }
        } );
    }
};

var Weapons         = {

    blueprint:          {},
    crafted:            {},
    selected:           {
        primary:    false,
        secondary:  false,
        melee:      false
    },
    tables:             {
        melee:   {},
        mods:    [],
        weapons: []
    },
    target:             false,

    _displayBlueprint:  function ( data, table )
    {
        var _html = "";

        var _stats_mod  = [];
        var _stats_skin = [];

        if ( table == "mod_skin" && Weapons.tables.mods[ table ].column( 4 ).visible() )
        {
            _stats_mod = [
                "mod_clip_i",
                "mod_ammo_i",
                "mod_rof_i",
                "mod_dmg_i",
                "mod_acc_i",
                "mod_stb_i",
                "mod_cc_i",
                "mod_thr_i",
                "mod_rs_i"
            ];
        }
        else
        {
            _stats_mod  = [
                "mod_clip_v",
                "mod_ammo_v",
                "mod_rof_v",
                "mod_dmg_v",
                "mod_acc_v",
                "mod_stb_v",
                "mod_cc_v",
                "mod_thr_v",
                "mod_rs_v",
                "mod_dps_v"
            ];
            _stats_skin = [
                "sk_clip_v",
                "sk_ammo_v",
                "sk_rof_v",
                "sk_dmg_v",
                "sk_acc_v",
                "sk_stb_v",
                "sk_cc_v",
                "sk_thr_v",
                "sk_rs_v",
                "sk_dps_v"
            ];
        }

        var _keys = Object.keys( data );
        _keys.sort();

        for ( var _i_ = 0, _l_ = _keys.length; _i_ < _l_; _i_++ )
        {
            var _mod_type_ = _keys[ _i_ ];

            for ( var _x_ = 0, _y_ = data[ _mod_type_ ].length; _x_ < _y_; _x_++ )
            {
                _html += "<tr>" + "<td width=\"8%\">" + data[ _mod_type_ ][ _x_ ].mod_type + "</td>" + "<td" + ( _mod_type_ == "skin" ? " class=\"color_" + data[ _mod_type_ ][ _x_ ].mod_rarity + "\"" : "" ) + " width=\"21%\">" + ( data[ _mod_type_ ][ _x_ ].loc_text ? data[ _mod_type_ ][ _x_ ].loc_text : "(nameless)" ) + "</td>";

                var _stats = ( _mod_type_ != "skin" ? _stats_mod : _stats_skin );

                for ( var _stat_ in _stats )
                {
                    if ( _stats.hasOwnProperty( _stat_ ) )
                    {
                        var _inverted = ( _stats[ _stat_ ] == "mod_rs_v" || _stats[ _stat_ ] == "sk_rs_v" );

                        if ( data[ _mod_type_ ][ _x_ ][ _stats[ _stat_ ] ] > 0 )
                        {
                            _html += "<td width=\"5%\" class=\"" + ( !_inverted ? "color_positive" : "color_negative" ) + "\">+" + data[ _mod_type_ ][ _x_ ][ _stats[ _stat_ ] ] + "</td>";
                        }
                        else if ( data[ _mod_type_ ][ _x_ ][ _stats[ _stat_ ] ] < 0 )
                        {
                            _html += "<td width=\"5%\" class=\"" + ( !_inverted ? "color_negative" : "color_positive" ) + "\">" + data[ _mod_type_ ][ _x_ ][ _stats[ _stat_ ] ] + "</td>";
                        }
                        else
                        {
                            _html += "<td width=\"5%\"></td>";
                        }
                    }
                }

                var _class = Loadout._formatDLC( data[ _mod_type_ ][ _x_ ].dlc_name );

                _html += "<td width=\"21%\" class=\"" + _class + "\">" + ( data[ _mod_type_ ][ _x_ ].dlc_name ? data[ _mod_type_ ][ _x_ ].dlc_name : "(base)" ) + "</td>";

                _html += "</tr>";
            }
        }

        if ( !_html )
        {
            return false;
        }

        return "<table class=\"table table-condensed\"><thead><tr><th>Type</th><th>Name</th><th>Mag</th><th>Ammo</th><th>RoF</th><th>Dmg</th><th>Acc</th><th>Stb</th><th>Cc</th><th>Thr</th><th>RS</th><th>DPS</th><th>Pack</th></tr></thead><tbody>" + _html + "</tbody></table>";
    },

    _displayMods:       function ( table )
    {
        var _row    = Weapons.tables.weapons[ table ].rows( ".selected" )[ 0 ];
        var _weapon = Weapons.tables.weapons[ table ].row( _row ).data();

        Weapons._updateStats( "id", _weapon.wp_factory_id, null );

        $( "#wp_mods" ).data( "wp_factory_id", _weapon.wp_factory_id ).css( "display", "block" );

        $( "#wp_target_image" ).html( "<img src=\"/img/weapons/" + _weapon.wp_weapon_id + ".png\" width=\"120\" height=\"60\">" );

        $( "[href^=#tab_mod_][href!=#tab_mod_all]" ).each( function ()
        {
            $( this ).closest( "li" ).addClass( "hidden" );
        } );

        Weapons._displayOverlay( Weapons.tables.mods, true );

        var _mods = [];

        for ( var _type_ in Weapons.crafted[ _weapon.wp_factory_id ] )
        {
            if ( Weapons.crafted[ _weapon.wp_factory_id ].hasOwnProperty( _type_ ) )
            {
                for ( var _i_ = 0, _l_ = Weapons.crafted[ _weapon.wp_factory_id ][ _type_ ].length; _i_ < _l_; _i_++ )
                {
                    _mods.push( Weapons.crafted[ _weapon.wp_factory_id ][ _type_ ][ _i_ ].mod_factory_id );
                }
            }
        }

        for ( _i_ = 0, _l_ = _weapon.wp_uses_parts.length; _i_ < _l_; _i_++ )
        {
            var _mid = "mod_" + _weapon.wp_uses_parts[ _i_ ];

            $( "[href=#tab_" + _mid + "]" ).closest( "li" ).removeClass( "hidden" );

            Weapons.tables.mods[ _mid ].clear();
        }

        $.post( "/api.php", { _: "mods", w: _weapon.wp_factory_id }, "json" ).done( function ( data )
        {
            data = JSON && JSON.parse( data ) || $.parseJSON( data );

            for ( var _i_ = 0, _l_ = data.data.length; _i_ < _l_; _i_++ )
            {
                var _all = "mod_all";
                var _tab = "mod_" + data.data[ _i_ ].mod_tab;

                var _data = data.data[ _i_ ];

                var _idx_a = Weapons.tables.mods[ _all ].row.add( _data ).index();
                var _idx_t = Weapons.tables.mods[ _tab ].row.add( _data ).index();

                if ( _mods.indexOf( _data.mod_factory_id ) !== -1 )
                {
                    Weapons.tables.mods[ _all ].row( _idx_a ).select( "!PROPAGATE" );
                    Weapons.tables.mods[ _tab ].row( _idx_t ).select( "!PROPAGATE" );
                }
            }

            Weapons._displayOverlay( Weapons.tables.mods, false );
        } );
    },

    _displayOverlay:    function ( tables, state )
    {
        for ( var _tid_ in tables )
        {
            if ( tables.hasOwnProperty( _tid_ ) )
            {
                if ( state )
                {
                    $( "#" + _tid_ + "_processing" ).css( "display", "block" );
                }
                else
                {
                    tables[ _tid_ ].draw();
                    $( "#" + _tid_ + "_processing" ).css( "display", "none" );
                }
            }
        }
    },

    _displayPanel:      function ( weapon, blueprint, skills, perk )
    {
        Page._panel( { _: "panels", __: "weapon", w: weapon, b: blueprint, s: skills, p: perk } );
    },

    _displayRules:      function ( data, table )
    {
        var _i_ = 0;
        var _l_ = 0;

        var _html = "";

        var _idx = ( table == "mod_skin" ? 4 : 3 );

        var _stats = Weapons.tables.mods[ table ].column( _idx ).visible() ? [
            "mod_clip_i",
            "mod_ammo_i",
            "mod_rof_i",
            "mod_dmg_i",
            "mod_acc_i",
            "mod_stb_i",
            "mod_cc_i",
            "mod_thr_i",
            "mod_rs_i"
        ] : [
            "mod_clip_v",
            "mod_ammo_v",
            "mod_rof_v",
            "mod_dmg_v",
            "mod_acc_v",
            "mod_stb_v",
            "mod_cc_v",
            "mod_thr_v",
            "mod_rs_v"
        ];

        if ( data.mod_rules.forbids )
        {
            for ( _i_ = 0, _l_ = data.mod_rules.forbids.length; _i_ < _l_; _i_++ )
            {
                (function ( _e_ )
                {
                    //noinspection JSUnusedLocalSymbols
                    Weapons.tables.mods[ "mod_all" ].rows( function ( mod_idx, mod_data, mod_node )
                    {
                        if ( mod_data.mod_factory_id === data.mod_rules.forbids[ _e_ ] )
                        {
                            _html += "<tr>" + "<td width=\"8%\" class=\"color_negative\">" + mod_data.mod_type + "</td>" + "<td width=\"18%\" class=\"color_negative\">" + mod_data.loc_text + "</td>";

                            for ( var _stat_ in _stats )
                            {
                                if ( _stats.hasOwnProperty( _stat_ ) )
                                {
                                    var _inverted = _stats[ _stat_ ] == "mod_rs_v";

                                    if ( mod_data[ _stats[ _stat_ ] ] > 0 )
                                    {
                                        _html += "<td width=\"6%\" class=\"" + ( !_inverted ? "color_negative" : "color_positive" ) + "\">+" + mod_data[ _stats[ _stat_ ] ] + "</td>";
                                    }
                                    else
                                    {
                                        if ( mod_data[ _stats[ _stat_ ] ] !== null )
                                        {
                                            _html += "<td width=\"6%\" class=\"" + ( !_inverted ? "color_negative" : "color_positive" ) + "\">" + mod_data[ _stats[ _stat_ ] ] + "</td>";
                                        }
                                        else
                                        {
                                            _html += "<td width=\"6%\"></td>";
                                        }
                                    }
                                }
                            }

                            var _class = Loadout._formatDLC( mod_data.dlc_name );

                            _html += "<td width=\"21%\" class=\"" + _class + "\">" + ( mod_data.dlc_name ? mod_data.dlc_name : "(base)" ) + "</td>";

                            _html += "</tr>";
                        }
                    } );
                })( _i_ );
            }
        }

        if ( data.mod_rules.depends_on )
        {
            for ( _i_ = 0, _l_ = data.mod_rules.depends_on.length; _i_ < _l_; _i_++ )
            {
                _html += "<tr>" + "<td width=\"10%\" class=\"color_dlc\">" + data.mod_rules.depends_on[ _i_ ].name + "</td>" + "<td width=\"18%\" class=\"color_dlc\">(any)</td>";

                for ( var _stat_ in _stats )
                {
                    if ( _stats.hasOwnProperty( _stat_ ) )
                    {
                        _html += "<td width=\"6%\"></td>";
                    }
                }

                _html += "<td width=\"24%\"></td>";

                _html += "</tr>";
            }
        }

        if ( data.mod_rules.adds )
        {
            for ( _i_ = 0, _l_ = data.mod_rules.adds.length; _i_ < _l_; _i_++ )
            {
                (function ( _e_ )
                {
                    //noinspection JSUnusedLocalSymbols
                    Weapons.tables.mods[ "mod_all" ].rows( function ( mod_idx, mod_data, mod_node )
                    {
                        if ( mod_data.mod_factory_id === data.mod_rules.adds[ _e_ ] )
                        {
                            _html += "<tr>" + "<td width=\"10%\" class=\"color_positive\">" + mod_data.mod_type + "</td>" + "<td width=\"18%\" class=\"color_positive\">" + mod_data.loc_text + "</td>";

                            for ( var _stat_ in _stats )
                            {
                                if ( _stats.hasOwnProperty( _stat_ ) )
                                {
                                    if ( mod_data[ _stats[ _stat_ ] ] > 0 )
                                    {
                                        _html += "<td width=\"6%\" class=\"color_positive\">+" + mod_data[ _stats[ _stat_ ] ] + "</td>";
                                    }
                                    else
                                    {
                                        if ( mod_data[ _stats[ _stat_ ] ] !== null )
                                        {
                                            _html += "<td width=\"6%\" class=\"color_negative\">" + mod_data[ _stats[ _stat_ ] ] + "</td>";
                                        }
                                        else
                                        {
                                            _html += "<td width=\"6%\"></td>";
                                        }
                                    }
                                }
                            }

                            var _class;

                            if ( mod_data.dlc_name )
                            {
                                if ( mod_data.dlc_name != "Community" )
                                {
                                    _class = "color_dlc";
                                }
                                else
                                {
                                    _class = "color_community";
                                }
                            }
                            else
                            {
                                _class = "color_base";
                            }

                            _html += "<td width=\"24%\" class=\"" + _class + "\">" + ( mod_data.dlc_name ? mod_data.dlc_name : "(base)" ) + "</td>";

                            _html += "</tr>";
                        }
                    } );
                })( _i_ );
            }
        }

        if ( !_html )
        {
            return false;
        }

        return "<table class=\"table table-condensed\"><thead><tr><th>Type</th><th>Name</th><th>Mag</th><th>Ammo</th><th>RoF</th><th>Dmg</th><th>Acc</th><th>Stb</th><th>Cc</th><th>Thr</th><th>RS</th><th>Pack</th></tr></thead><tbody>" + _html + "</tbody></table>";
    },

    _eventInit:         function ()
    {
        Weapons._displayOverlay( Weapons.tables.weapons, true );

        $.post( "/api.php", { _: "weapons", s: Skills.selected, p: $( ".pk_selected" ).data( "id" ) }, "json" ).done( function ( data )
        {
            data = JSON && JSON.parse( data ) || $.parseJSON( data );

            for ( var _i_ = 0, _l_ = data.data.length; _i_ < _l_; _i_++ )
            {
                var _wid = "wp_" + data.data[ _i_ ].wp_slot + "_";

                Weapons.tables.weapons[ _wid + "all" ].row.add( data.data[ _i_ ] );
                Weapons.tables.weapons[ _wid + data.data[ _i_ ].wp_category ].row.add( data.data[ _i_ ] );
            }

            if ( Weapons.selected.primary )
            {
                //noinspection JSUnusedLocalSymbols
                Weapons.tables.weapons[ "wp_2_all" ].rows( function ( idx, data, node )
                {
                    return data.wp_factory_id === Weapons.selected.primary;
                } ).select();
            }

            if ( Weapons.selected.secondary )
            {
                //noinspection JSUnusedLocalSymbols
                Weapons.tables.weapons[ "wp_1_all" ].rows( function ( idx, data, node )
                {
                    return data.wp_factory_id === Weapons.selected.secondary;
                } ).select();
            }

            Weapons._displayOverlay( Weapons.tables.weapons, false );

            Armors._updateStats();
        } );
    },

    _shrinkBlueprint:   function ( blueprint )
    {
        var _shrunk = {};

        for ( var _type in blueprint )
        {
            if ( blueprint.hasOwnProperty( _type ) )
            {
                _shrunk[ _type ] = {};

                for ( var _i_ = 0, _l_ = blueprint[ _type ].length; _i_ < _l_; _i_++ )
                {
                    _shrunk[ _type ][ _i_ ] = { mod_factory_id: blueprint[ _type ][ _i_ ][ "mod_factory_id" ] };
                }
            }
        }

        return _shrunk;
    },

    _updateBlueprint:   function ( mod_data, action )
    {
        var _data = $( "#wp_mods" ).data();

        if ( action === 1 )
        {
            if ( !mod_data.mod_blueprint )
            {
                Weapons.crafted[ _data.wp_factory_id ][ mod_data.mod_type_ ] = [ mod_data ];
            }
            else
            {
                Weapons.crafted[ _data.wp_factory_id ] = mod_data.mod_blueprint;

                var _skin = {};

                var _keys = Object.keys( mod_data );

                for ( var _x_ = 0, _y_ = _keys.length; _x_ < _y_; _x_++ )
                {
                    if ( _keys[ _x_ ] != "mod_blueprint" )
                    {
                        _skin[ _keys[ _x_ ] ] = mod_data[ _keys[ _x_ ] ];
                    }
                }

                Weapons.crafted[ _data.wp_factory_id ][ mod_data.mod_type_ ] = [ _skin ];
            }
        }
        else if ( action === -1 )
        {
            if ( !mod_data.mod_blueprint )
            {
                if ( Weapons.crafted[ _data.wp_factory_id ][ mod_data.mod_type_ ] )
                {
                    for ( var _i_ = 0, _l_ = Weapons.crafted[ _data.wp_factory_id ][ mod_data.mod_type_ ].length; _i_ < _l_; _i_++ )
                    {
                        if ( Weapons.crafted[ _data.wp_factory_id ][ mod_data.mod_type_ ][ _i_ ].mod_factory_id === mod_data.mod_factory_id )
                        {
                            delete Weapons.crafted[ _data.wp_factory_id ][ mod_data.mod_type_ ];
                            break;
                        }
                    }

                    if ( ( !Weapons.crafted[ _data.wp_factory_id ][ mod_data.mod_type_ ] ) && ( Weapons.blueprint[ _data.wp_factory_id ][ mod_data.mod_type_ ] ) )
                    {
                        Weapons.crafted[ _data.wp_factory_id ][ mod_data.mod_type_ ] = Weapons.blueprint[ _data.wp_factory_id ][ mod_data.mod_type_ ];
                    }
                }
            }
            else
            {
                Weapons.crafted[ _data.wp_factory_id ] = Weapons.blueprint[ _data.wp_factory_id ];
            }
        }

        Weapons._updateStats( "id", _data.wp_factory_id, null );

        $( ".selected td" ).find( ".wp_blueprint_control" ).trigger( "click" ).trigger( "click" );
    },

    _updateStats:       function ( type, target, e )
    {
        var _weapons = {};

        if ( type == "table" )
        {
            var _event  = $( e.target );
            var _button = _event.is( "span" ) ? _event.parent() : _event;

            _button.addClass( "disabled ajax_primary" );

            //noinspection JSUnusedLocalSymbols
            target.rows( function ( idx, data, node )
            {
                _weapons[ data.wp_factory_id ] = Weapons._shrinkBlueprint( Weapons.crafted[ data.wp_factory_id ] );
            } );
        }
        else
        {
            _weapons[ target ] = Weapons._shrinkBlueprint( Weapons.crafted[ target ] );
        }

        $.post( "/api.php", { _: "weapons", __: "update", w: _weapons, s: Skills.selected, p: $( ".pk_selected" ).data( "id" ) }, "json" ).done( function ( response )
        {
            var _data = JSON && JSON.parse( response ) || $.parseJSON( response );

            if ( _data.success )
            {
                for ( var _table in Weapons.tables.weapons )
                {
                    if ( Weapons.tables.weapons.hasOwnProperty( _table ) )
                    {
                        //noinspection JSUnusedLocalSymbols
                        Weapons.tables.weapons[ _table ].rows( function ( idx, data, node )
                        {
                            var _array = _data.data[ data.wp_factory_id ];

                            for ( var _col in _array )
                            {
                                if ( _array.hasOwnProperty( _col ) )
                                {
                                    Weapons.tables.weapons[ _table ].cell( idx, _col )
                                        .data( _array[ _col ].value )
                                        .nodes()
                                        .to$()
                                        .removeClass( "color_max color_positive color_negative color_normal" )
                                        .addClass( _array[ _col ].color );

                                    if ( type == "id" && $( "#wp_mods" ).is( ":visible" ) )
                                    {
                                        $( ".wp_target_cell[data-column=\"" + _col + "\"" )
                                            .removeClass( "color_max color_positive color_negative color_normal" )
                                            .addClass( _array[ _col ].color )
                                            .html( _array[ _col ].value );
                                    }
                                }
                            }
                        } ).draw();
                    }
                }
            }

            if ( type == "table" )
            {
                _button.removeClass( "disabled ajax_primary" );
            }
        } );
    },

    _validateSelection: function ()
    {
        var _i_ = 0;
        var _l_ = 0;
        var _x_ = 0;
        var _y_ = 0;

        var _forbids = [];
        var _adds    = [];
        var _locked  = "";
        var _types   = [];

        var _selection = Weapons.tables.mods[ "mod_all" ].rows( { selected: true } ).data();

        for ( _i_ = 0, _l_ = _selection.length; _i_ < _l_; _i_++ )
        {
            if ( _selection[ _i_ ].mod_rules && _selection[ _i_ ].mod_rules.forbids )
            {
                for ( _x_ = 0, _y_ = _selection[ _i_ ].mod_rules.forbids.length; _x_ < _y_; _x_++ )
                {
                    _forbids.push( _selection[ _i_ ].mod_rules.forbids[ _x_ ] );
                }
            }

            if ( _selection[ _i_ ].mod_rules && _selection[ _i_ ].mod_rules.adds )
            {
                for ( _x_ = 0, _y_ = _selection[ _i_ ].mod_rules.adds.length; _x_ < _y_; _x_++ )
                {
                    _adds.push( _selection[ _i_ ].mod_rules.adds[ _x_ ] );
                }
            }

            if ( _selection[ _i_ ].mod_rules && _selection[ _i_ ].mod_rules.locked )
            {
                _locked = _selection[ _i_ ].mod_factory_id;
            }

            _types.push( _selection[ _i_ ].mod_type_ );
        }

        Weapons.tables.mods[ "mod_all" ].rows( function ( idx, data, node )
        {
            var _tid = ( Weapons.tables.mods[ "mod_" + data.mod_type_ ] ? data.mod_type_ : "special" );

            var _enable = true;

            if ( data.mod_rules )
            {
                if ( data.mod_rules.depends_on )
                {
                    _enable = ( _types.length ? true : false );

                    for ( _i_ = 0, _l_ = data.mod_rules.depends_on.length; _i_ < _l_; _i_++ )
                    {
                        for ( _x_ = 0, _y_ = _types.length; _x_ < _y_; _x_++ )
                        {
                            if ( _types.indexOf( data.mod_rules.depends_on[ _i_ ].type ) === -1 )
                            {
                                _enable = false;
                            }
                        }
                    }
                }

                if ( data.mod_rules.immune )
                {
                    _enable = true;
                }
            }

            for ( var _i_ = 0, _l_ = _forbids.length; _i_ < _l_; _i_++ )
            {
                if ( data.mod_factory_id === _forbids[ _i_ ] )
                {
                    _enable = false;
                }
            }

            if ( _locked && data.mod_type_ != "skin" )
            {
                _enable = false;
            }

            if ( _enable )
            {
                $( node ).closest( "tr" ).removeClass( "disabled" );

                Weapons.tables.mods[ "mod_" + _tid ].rows( function ( mod_idx, mod_data, mod_node )
                {
                    if ( mod_data.mod_factory_id === data.mod_factory_id )
                    {
                        $( mod_node ).closest( "tr" ).removeClass( "disabled" );
                    }
                } );
            }
            else
            {
                if ( !_locked )
                {
                    Weapons.tables.mods[ "mod_all" ].row( idx ).deselect( "!PROPAGATE" );
                }

                $( node ).closest( "tr" ).addClass( "disabled" );

                Weapons.tables.mods[ "mod_" + _tid ].rows( function ( mod_idx, mod_data, mod_node )
                {
                    if ( mod_data.mod_factory_id === data.mod_factory_id )
                    {
                        if ( !_locked )
                        {
                            Weapons.tables.mods[ "mod_" + _tid ].row( mod_idx ).deselect( "!PROPAGATE" );
                        }

                        $( mod_node ).closest( "tr" ).addClass( "disabled" );
                    }
                } );
            }
        } );
    }

};

var Throwables      = {

    locked:             { 17: "chico_injector", 18: "smoke_screen_grenade", 19: "damage_control", 20: "tag_team", 21: "pocket_ecm_jammer" },
    target:             false,

    _eventChangePerk:   function ( action, perk )
    {
        for ( var _perk in Throwables.locked )
        {
            if ( Throwables.locked.hasOwnProperty( _perk ) )
            {
                var _throwable = $( ".thrw_item[data-id=\"" + Throwables.locked[ _perk ] + "\"]" );

                if ( _perk == perk && action )
                {
                    var _selected = $( ".thrw_selected" );

                    if ( _selected )
                    {
                        _selected.removeClass( "thrw_selected" );
                    }

                    _throwable.removeClass( "thrw_locked" ).addClass( "thrw_selected" );
                }
                else
                {
                    _throwable.removeClass( "thrw_selected" ).addClass( "thrw_locked" );
                }
            }
        }

        Throwables._updateSelection();
    },

    _eventHoverOff:     function ()
    {
        var _selected = $( ".thrw_selected" ).data( "id" );

        Throwables.target = _selected ? _selected : $( ".thrw_item" ).first().data( "id" );

        Throwables._updateDetails();
    },

    _eventHoverOn:      function ( e )
    {
        Throwables.target = $( e.currentTarget ).data( "id" );

        Throwables._updateDetails();
    },

    _eventInit:         function ()
    {
        for ( var _perk in Throwables.locked )
        {
            if ( Throwables.locked.hasOwnProperty( _perk ) )
            {
                if ( $( ".pk_selected" ).data( "id" ) != _perk )
                {
                    $( ".thrw_item[data-id=\"" + Throwables.locked[ _perk ] + "\"]" ).removeClass( "thrw_selected" ).addClass( "thrw_locked" );
                }
            }
        }

        Throwables._updateSelection();
        Throwables._eventHoverOff();
    },

    _eventSelectOff:    function ( e )
    {
        var _elem = $( e.target );

        if ( _elem.hasClass( "thrw_selected" ) )
        {
            _elem.removeClass( "thrw_selected" );
            Throwables._updateSelection();
        }

        return false;
    },

    _eventSelectOn:     function ( e )
    {
        var _elem = $( e.currentTarget );

        if ( _elem.hasClass( "thrw_locked" ) )
        {
            return;
        }

        var _selected = $( ".thrw_selected" );

        if ( _selected.data( "id" ) == _elem.data( "id" ) )
        {
            _elem.removeClass( "thrw_selected" );
        }
        else
        {
            _selected.removeClass( "thrw_selected" );
            _elem.addClass( "thrw_selected" );
        }

        Throwables._updateSelection();
    },

    _updateDetails:     function ()
    {
        var _elem =  $( "[data-id=\"" + Throwables.target + "\"]" );

        var _details = $( "#thrw_details" );

        _details.html( _elem.data( "details" ) );

        if ( _elem.hasClass( "thrw_locked" ) )
        {
            $( _elem.data( "locked" ) ).insertAfter( _details.find( "h4" ) );
        }
    },

    _updateSelection:   function ()
    {
        var _selected = $( ".thrw_selected" ).length;

        $( ".thrw_item" ).each( function ()
        {
            var _item = $( this );

            if ( !_item.hasClass( "thrw_locked" ) )
            {
                if ( _item.hasClass( "thrw_selected" ) || !_selected )
                {
                    _item.find( "img" ).css( "opacity", 1 );
                }
                else
                {
                    _item.find( "img" ).css( "opacity", 0.2 );
                }
            }
            else
            {
                _item.find( "img" ).css( "opacity", 0.1 );
            }
        } );
    }
};

var Armors          = {

    table:              {},
    target:             false,

    _eventChangeMisc:   function ()
    {
        if ( Skills.selected.indexOf( "jail_diet_basic" ) !== -1 )
        {
            Armors._updateStats();
        }
    },

    _eventChangeSkill:  function ( action, skill, state )
    {
        var _armor = $( ".arm_item[data-id=\"level_7\"]" );

        if ( skill )
        {
            if ( ( skill == "control_freak" ) || ( skill == "show_of_force" && state == "aced" ) || ( skill == "awareness" && state == "basic" ) || ( skill == "thick_skin" && state == "aced" ) || ( skill == "jail_diet" ) || ( skill == "frenzy" && state == "basic" ) )
            {
                Armors._updateStats();
            }
            else if ( skill == "juggernaut" )
            {
                if ( state == "basic" )
                {
                    Armors._updateStats();
                }
                else
                {
                    if ( action )
                    {
                        _armor.removeClass( "arm_locked" );
                    }
                    else
                    {
                        _armor.removeClass( "arm_selected" ).addClass( "arm_locked" );
                    }

                    Armors._updateSelection();
                }
            }
        }
    },

    _eventChangePerk:   function ()
    {
        Armors._updateStats();
    },

    _eventHoverOff:     function ()
    {
        var _selected = $( ".arm_selected" ).data( "id" );

        Armors.target = _selected ? _selected : $( ".arm_item" ).first().data( "id" );

        Armors._updateDetails();
    },

    _eventHoverOn:      function ( e )
    {
        Armors.target = $( e.currentTarget ).data( "id" );

        Armors._updateDetails();
    },

    _eventInit:         function ()
    {
        if ( Skills.selected.indexOf( "juggernaut_aced" ) === -1 )
        {
            $( ".arm_item[data-id=\"level_7\"]" ).removeClass( "arm_selected" ).addClass( "arm_locked" );
        }

        Armors._updateSelection();
        Armors._eventHoverOff();
    },

    _eventSelectOff:    function ( e )
    {
        var _elem = e.currentTarget ? $( e.currentTarget ) : $( e.target );

        if ( _elem.hasClass( "arm_selected" ) )
        {
            Armors.target = $( ".arm_item" ).first().data( "id" );

            _elem.removeClass( "arm_selected" );
        }

        Armors._updateSelection();
        Loadout._updateRisk();

        return false;
    },

    _eventSelectOn:     function ( e )
    {
        var _elem = $( e.currentTarget );

        if ( _elem.hasClass( "arm_locked" ) )
        {
            return;
        }

        var _selected = $( ".arm_selected" );

        if ( _selected.data( "id" ) == _elem.data( "id" ) )
        {
            _elem.removeClass( "arm_selected" );
        }
        else
        {
            _selected.removeClass( "arm_selected" );
            _elem.addClass( "arm_selected" );
        }

        Armors._updateSelection();
        Loadout._updateRisk();
    },

    _updateDetails:     function ()
    {
        var _elem =  $( "[data-id=\"" + Armors.target + "\"]" );

        var _name = $( "#arm_name" );

        _name.html( _elem.data( "name" ) );

        if ( _elem.hasClass( "arm_locked" ) )
        {
            $( _elem.data( "locked" ) ).insertAfter( _name.find( "h4" ) );
        }

        Armors.table.search( Armors.target ).draw();
    },

    _updateSelection:   function ()
    {
        var _selected = $( ".arm_selected" ).length;

        $( ".arm_item" ).each( function ()
        {
            var _item = $( this );

            if ( !_item.hasClass( "arm_locked" ) )
            {
                if ( _item.hasClass( "arm_selected" ) || !_selected )
                {
                    _item.find( "img" ).css( "opacity", 1 );
                }
                else
                {
                    _item.find( "img" ).css( "opacity", 0.2 );
                }
            }
            else
            {
                _item.find( "img" ).css( "opacity", 0.1 );
            }
        } );
    },

    _updateStats:       function ()
    {
        var _primary    = Weapons.tables.weapons[ "wp_2_all" ].rows( ".selected" ).data()[ 0 ];
        var _secondary  = Weapons.tables.weapons[ "wp_1_all" ].rows( ".selected" ).data()[ 0 ];
        var _melee      = Weapons.tables.melee.rows( ".selected" ).data()[ 0 ];

        if ( typeof Armors.table.clear === "function" )
        {
            Armors.table.clear();
        }

        $.post( "/api.php",
            {
                _: "armors",
                s:  Skills.selected,
                p:  $( ".pk_selected" ).data( "id" ),
                w2: _primary ? _primary.wp_factory_id : "",
                b2: _primary ? Weapons.crafted[ _primary.wp_factory_id ] : {},
                w1: _secondary ? _secondary.wp_factory_id : "",
                b1: _secondary ? Weapons.crafted[ _secondary.wp_factory_id ] : {},
                m:  _melee ? _melee.ml_factory_id : ""
            }, "json" ).done( function ( data )
        {
            data = JSON && JSON.parse( data ) || $.parseJSON( data );

            for ( var _i_ = 0, _l_ = data.data.length; _i_ < _l_; _i_++ )
            {
                Armors.table.row.add( data.data[ _i_ ] );
            }

            Armors._eventHoverOff();
        } );
    }

};

var Deployables     = {

    selected:           [],
    target:             false,

    _eventChangeSkill:  function ( action, skill, state )
    {
        var _deployable = $( ".dpl_item[data-id=\"sentry_gun_silent\"]" );

        if ( skill == "engineering" && state == "basic" )
        {
            if ( action )
            {
                _deployable.removeClass( "dpl_locked" );
            }
            else
            {
                _deployable.addClass( "dpl_locked" );

                var _idx = Deployables.selected.indexOf( _deployable.data( "id" ) );

                if ( _idx !== -1 )
                {
                    Deployables.selected.splice( _idx, 1 );
                }
            }
        }
        else if ( skill == "jack_of_all_trades" && state == "aced" )
        {
            Deployables.selected = Deployables.selected.slice( 0, 1 );
        }

        Deployables._updateSelection();
    },

    _eventHoverOff:     function ()
    {
        var _selected = $( ".dpl_selected" ).last().data( "id" );

        Deployables.target = _selected ? _selected : $( ".dpl_item" ).first().data( "id" );

        Deployables._updateDetails();
    },

    _eventHoverOn:      function ( e )
    {
        Deployables.target = $( e.currentTarget ).data( "id" );

        Deployables._updateDetails();
    },

    _eventInit:         function ()
    {
        if ( Skills.selected.indexOf( "engineering_basic" ) === -1 )
        {
            $( ".dpl_item[data-id=\"sentry_gun_silent\"]" ).addClass( "dpl_locked" );
        }

        Deployables._updateSelection();
        Deployables._eventHoverOff();
    },

    _eventSelectOff:    function ( e )
    {
        var _idx = Deployables.selected.indexOf( $( e.target ).data( "id" ) );

        if ( _idx !== -1 )
        {
            Deployables.selected.splice( _idx, 1 );
            Deployables._updateSelection();
        }

        return false;
    },

    _eventSelectOn:     function ( e )
    {
        var _elem = $( e.currentTarget );

        if ( _elem.hasClass( "dpl_locked" ) )
        {
            return;
        }

        var _id     = _elem.data( "id" );

        var _jack   = Skills.selected.indexOf( "jack_of_all_trades_aced" ) !== -1;

        if ( Deployables.selected.indexOf( _id ) === -1 )
        {
            if ( ( !_jack && Deployables.selected.length == 1 ) || ( _jack && Deployables.selected.length == 2 ) )
            {
                Deployables.selected = [];
            }

            Deployables.selected.push( _id );
        }
        else
        {
            Deployables.selected.splice( Deployables.selected.indexOf( _id ), 1 );
        }

        Deployables._updateSelection();
    },

    _updateDetails:     function ()
    {
        var _elem =  $( "[data-id=\"" + Deployables.target + "\"]" );

        var _details = $( "#dpl_details" );

        _details.html( _elem.data( "details" ) );

        if ( _elem.hasClass( "dpl_locked" ) )
        {
            _details.append( _elem.data( "locked" ) );
        }
    },

    _updateSelection:   function ()
    {
        var _jack       = Skills.selected.indexOf( "jack_of_all_trades_aced" ) !== -1;

        var _selected   = Deployables.selected.length;

        $( ".dpl_item" ).each( function ()
        {
            var _item   = $( this );
            var _idx    = Deployables.selected.indexOf( _item.data( "id" ) );

            if ( !_item.hasClass( "dpl_locked" ) )
            {
                if ( _idx !== -1 || !_selected )
                {
                    _item.find( "img" ).css( "opacity", 1 );

                    if ( _idx !== -1 )
                    {
                        _item.addClass( "dpl_selected" );
                        _item.attr( "data-selected", ( _jack ? ( _idx == 0 ? "PRIMARY" : "SECONDARY" ) : "EQUIPPED" ) );
                    }
                    else
                    {
                        _item.removeClass( "dpl_selected" );
                    }
                }
                else
                {
                    _item.removeClass( "dpl_selected" );
                    _item.find( "img" ).css( "opacity", 0.2 );
                }
            }
            else
            {
                _item.removeClass( "dpl_selected" );
                _item.find( "img" ).css( "opacity", 0.1 );
            }
        } );
    }
};

var Loadout         = {

    inventory:          {},

    _delete:            function ( e )
    {
        var _event  = $( e.target );
        var _button = _event.is( "span" ) ? _event.parent() : _event;

        _button.addClass( "disabled ajax_danger" );

        var _row = Loadout.inventory.rows( ".selected" )[ 0 ];

        $.post( "/api.php", { _: "loadouts", __: "delete", h:  Loadout.inventory.row( _row ).data().data.ldt_hash }, "json" ).done( function ( data )
        {
            data = JSON && JSON.parse( data ) || $.parseJSON( data );

            if ( data.success )
            {
                Loadout.inventory.row( _row ).remove().draw();

                $( "#ldt_inventory_filter" ).before( "<div class=\"alert alert-success fade in dataTables_message\">" + "<button type=\"button\" class=\"close\" data-dismiss=\"alert\">&times;</button>" + "<strong>SUCCESS: </strong>" + data.message + "&nbsp;</div>" );
            }
            else
            {
                $( "#ldt_inventory_filter" ).before( "<div class=\"alert alert-danger fade in dataTables_message\">" + "<button type=\"button\" class=\"close\" data-dismiss=\"alert\">&times;</button>" + "<strong>ERROR: </strong>" + data.message + "&nbsp;</div>" );
            }

            $( "#ldt_inventory_wrapper" ).find( ".dataTables_message" ).delay( 4000 ).fadeOut( 2000, function ()
            {
                $( this ).remove();
            } );

            _button.removeClass( "disabled ajax_danger" );
        } );
    },

    _displayContest:   function ( hash )
    {
        Page._panel( { _: "panels", __: "contest", h: hash } );
    },

    _displayDLCPanel:   function ( hash )
    {
        Page._panel( { _: "panels", __: "dlcs", h: hash } );
    },

    _displayMessage:    function ( state, message )
    {
        if ( state )
        {
            $( "#user_message" ).prepend( "<div class=\"alert alert-success fade in dataTables_message\" style=\"left: 0\">" + "<button type=\"button\" class=\"close\" data-dismiss=\"alert\">&times;</button>" + "<strong>SUCCESS: </strong> " + message + "&nbsp;</div>" );
        }
        else
        {
            $( "#user_message" ).prepend( "<div class=\"alert alert-danger fade in dataTables_message\" style=\"left: 0\">" + "<button type=\"button\" class=\"close\" data-dismiss=\"alert\">&times;</button>" + "<strong>ERROR: </strong> " + message + "&nbsp;</div>" );
        }
    },

    _eventChangePerk:   function ( action, perk )
    {
        Throwables._eventChangePerk( action, perk );
        Armors._eventChangePerk();
        Loadout._updateRisk();
    },

    _eventChangeSkill:  function ( action, skill, state )
    {
        Armors._eventChangeSkill( action, skill, state );
        Deployables._eventChangeSkill( action, skill, state );

        if ( ( skill == "thick_skin" ) || ( skill == "optic_illusions" && state == "aced" ) )
        {
            Loadout._updateRisk();
        }
    },

    _formatDLC:         function ( name )
    {
        return ( name ? ( name != "Community" ? "color_dlc" : "color_community" ) : "color_base" );
    },

    _formatRisk:        function ( risk )
    {
        var _deg = 0;

        if ( risk !== null && risk !== false )
        {
            _deg = ( risk * 1.8 );
        }

        $( ".risk_meter_fill_left" ).css( {
            "-moz-transform":       "rotate(" + _deg + "deg)",
            "-webkit-transform":    "rotate(" + _deg + "deg)",
            "-o-transform":         "rotate(" + _deg + "deg)",
            "transform":            "rotate(" + _deg + "deg)"
        } );

        $( ".risk_meter_fill_right" ).css( {
            "-moz-transform":       "rotate(-" + _deg + "deg)",
            "-webkit-transform":    "rotate(-" + _deg + "deg)",
            "-o-transform":         "rotate(-" + _deg + "deg)",
            "transform":            "rotate(-" + _deg + "deg)"
        } );

        var _number = $( ".risk_meter_value_number" );

        _number.html( risk ? risk : "" );

        var _classes = ( risk ? ( risk == 75 ? "risk_maximum risk_value_maximum" : "risk_value_normal" ) : ( risk === false ? "risk_value_incomplete" : "risk_value_none" ) );

        $( ".risk_text" ).removeClass( "risk_maximum risk_value_incomplete risk_value_maximum risk_value_none risk_value_normal" ).addClass( _classes );

        if ( risk == 75 )
        {
            _number.addClass( "risk_maximum" );
        }
        else
        {
            _number.removeClass( "risk_maximum" );
        }
    },

    _send:              function ( action, e )
    {
        if ( action == "save" )
        {
            var _name = $( "#option_name" ).val();

            if ( !_name )
            {
                Loadout._displayMessage( false, "Name is required." );
                return;
            }

            var _button = $( e.target );

            _button.addClass( "disabled ajax_primary" );
        }

        var _primary   = Weapons.tables.weapons[ "wp_2_all" ].rows( ".selected" ).data()[ 0 ];
        var _secondary = Weapons.tables.weapons[ "wp_1_all" ].rows( ".selected" ).data()[ 0 ];
        var _melee     = Weapons.tables.melee.rows( ".selected" ).data()[ 0 ];

        $.post( "/api.php",
            {
                _: "loadouts",
                __: action,
                n:  _name ? _name : "",
                s:  Skills.selected,
                p:  $( ".pk_selected" ).data( "id" ),
                w2: _primary ? _primary.wp_factory_id : "",
                b2: _primary ? Weapons._shrinkBlueprint( Weapons.crafted[ _primary.wp_factory_id ] ) : {},
                w1: _secondary ? _secondary.wp_factory_id : "",
                b1: _secondary ? Weapons._shrinkBlueprint( Weapons.crafted[ _secondary.wp_factory_id ] ) : {},
                m:  _melee ? _melee.ml_factory_id : "",
                t:  $( ".thrw_selected" ).data( "id" ),
                a:  $( ".arm_selected" ).data( "id" ),
                d:  Deployables.selected
            }, "json" ).done( function ( data )
        {
            data = JSON && JSON.parse( data ) || $.parseJSON( data );

            $( "#user_input_waiting" ).hide();

            if ( data.success )
            {
                if ( action == "save" )
                {
                    Loadout.inventory.row.add( data.data );

                    Loadout.inventory.draw();

                    $( "#user_input_save" ).hide();

                    Loadout._displayMessage( true, "Loadout saved." );
                }
                else
                {
                    if ( action == "download" )
                    {
                        window.location = "https://web.archive.org/web/20181130031524/http://pd2tools.com/dl/" + data.hash;
                    }
                    else if ( action == "contest" )
                    {
                        Loadout._displayContest( data.hash );
                    }
                    else
                    {
                        var _url = "https://web.archive.org/web/20181130031524/http://pd2tools.com/l/" + data.hash;

                        Loadout._displayMessage( true, "<a href=\"" + _url + "\" title=\"View Loadout\">" + _url + "</a>&nbsp;" );
                    }
                }
            }
            else
            {
                Loadout._displayMessage( false, data.message );
            }

            _button.removeClass( "disabled ajax_primary" );
        } );

    },

    _updateRisk:        function ()
    {
        var _primary    = Weapons.tables.weapons[ "wp_2_all" ].rows( ".selected" ).data()[ 0 ];
        var _secondary  = Weapons.tables.weapons[ "wp_1_all" ].rows( ".selected" ).data()[ 0 ];
        var _melee      = Weapons.tables.melee.rows( ".selected" ).data()[ 0 ];
        var _armor      = $( ".arm_selected" ).data( "id" );

        if ( _primary && _secondary && _melee && _armor )
        {
            $.post( "/api.php",
                {
                    "_":    "player",
                    "__":   "risk",
                    s:      Skills.selected,
                    p:      $( ".pk_selected" ).data( "id" ),
                    w2:     _primary.wp_factory_id,
                    b2:     Weapons._shrinkBlueprint( Weapons.crafted[ _primary.wp_factory_id ] ),
                    w1:     _secondary.wp_factory_id,
                    b1:     Weapons._shrinkBlueprint( Weapons.crafted[ _secondary.wp_factory_id ] ),
                    m:      _melee.ml_factory_id,
                    a:      _armor
                }, "json" ).done( function ( data )
            {
                data = JSON && JSON.parse( data ) || $.parseJSON( data );

                if ( data.success )
                {
                    Loadout._formatRisk( data.data );
                }
                else
                {
                    Loadout._formatRisk( null );
                }
            } );
        }
        else
        {
            Loadout._formatRisk( false );
        }
    }

};

var Page            = {

    tabs:           [],

    _armors:        function ()
    {
        //noinspection JSUnusedLocalSymbols
        Armors.table = $( "#arm_stats_table" ).DataTable( {
            "autoWidth":        true,
            "columns":          [
                {
                    "data":				"arm_factory_id",
                    "visible":          false
                },
                {
                    "data":				"loc_text",
                    "width":            "40%"
                },
                {
                    "data":             "stats_total",
                    "width":            "20%"
                },
                {
                    "data":             "stats_base",
                    "width":            "20%"
                },
                {
                    "data":             "stats_skills",
                    "width":            "20%"
                }
            ],
            "columnDefs":       [
                {
                    "targets":          [ 0, 1, 2, 3, 4 ],
                    "orderable":        false
                },
                {
                    "targets":          [ 1, 2, 3, 4 ],
                    "searchable":       false
                }
            ],
            "createdRow":       function ( row, data, index )
            {
                if ( data.stats_skills )
                {
                    $( "td", row ).eq( 1 ).addClass( data.stats_skills > 0 ? "color_positive" : "color_negative" );
                    $( "td", row ).eq( 3 ).addClass( data.stats_skills > 0 ? "color_positive" : "color_negative" );

                    if ( data.stats_skills > 0 )
                    {
                        $( "td", row ).eq( 3 ).prepend( "+" );
                    }
                }
            },
            "dom":              "tr",
            "language":         {
                "zeroRecords":  "Waiting for the weapons to load..."
            },
            "order":            [ ],
            "paging":           false,
            "processing":       false,
            "scrollY":          "275px",
            "scrollCollapse":   true
        } );

        $( ".arm_item" ).on( "click", Armors._eventSelectOn )
            .on( "contextmenu", Armors._eventSelectOff )
            .hover( Armors._eventHoverOn, Armors._eventHoverOff );

        Armors._eventInit();
    },

    _deployables:   function ()
    {
        $( ".dpl_item" ).on( "click", Deployables._eventSelectOn )
            .on( "contextmenu", Deployables._eventSelectOff )
            .hover( Deployables._eventHoverOn, Deployables._eventHoverOff );

        Deployables._eventInit();
    },

    _footer:        function ()
    {
        if ( ( $( "#wrapper" ).height() + 55 + 66 ) > $( window ).height() )
        {
            $( "footer" ).css( "position", "relative" );
        }
        else
        {
            $( "footer" ).css( "position", "absolute" );
        }
    },

    _init:          function ()
    {
        Page._footer();
        Page._tabs();

        Page._skills();
        Page._perks();
        Page._weapons();
        Page._throwables();
        Page._armors();
        Page._deployables();
        Page._loadout();
    },

    _loadout:       function ()
    {
        $( "#user_option_save" ).on( "click", function ()
        {
            $( "#user_message" ).html( "" );
            $( "#user_input_waiting" ).hide();
            $( "#user_input_save" ).css( "display", "table" );
        } );

        $( "#user_option_share" ).on( "click", function ()
        {
            $( "#user_message" ).html( "" );
            $( "#user_input_save" ).hide();
            $( "#user_input_waiting" ).css( "display", "block" );
            $( "#user_input_waiting_progress" ).find( "div" ).html( "Creating share link ..." );

            Loadout._send( "share", null );
        } );

        $( "#user_option_download" ).on( "click", function ( e )
        {
            if ( $( e.target ).attr( "id" ) == "user_option_download_info" )
            {
                return;
            }

            $( "#user_message" ).html( "" );
            $( "#user_input_save" ).hide();
            $( "#user_input_waiting" ).css( "display", "block" );
            $( "#user_input_waiting_progress" ).find( "div" ).html( "Preparing download ..." );

            Loadout._send( "download", null );
        } );

        $( "#user_option_contest" ).on( "click", function ()
        {
            $( "#user_message" ).html( "" );
            $( "#user_input_save" ).hide();
            $( "#user_input_waiting" ).css( "display", "block" );
            $( "#user_input_waiting_progress" ).find( "div" ).html( "Submitting entry ..." );

            Loadout._send( "contest", null );
        } );

        $( "#option_save" ).on( "click", function( e )
        {
            Loadout._send( "save", e );
        } );

        //noinspection JSUnusedLocalSymbols
        Loadout.inventory = $( "#ldt_inventory" ).DataTable( {
            "ajax":           {
                "url":  "/api.php",
                "type": "POST",
                "data": function ( post )
                {
                    post._  = "loadouts";
                    post.__ = "browse";
                }
            },
            "autoWidth":      true,
            "buttons":        [
                {
                    "extend":    "selected",
                    "text":      "<span class=\"glyphicon glyphicon-trash\" aria-hidden=\"true\"></span> Delete",
                    "className": "btn-danger",
                    "action":    function ( e, dt, node, config )
                    {
                        Loadout._delete( e );
                    }
                }
            ],
            "columns":        [
                {
                    "data":           null,
                    "className":      "select-checkbox",
                    "orderable":      false,
                    "searchable":     false,
                    "width":          "22px",
                    "defaultContent": ""
                },
                {
                    "data":           null,
                    "className":      "url_control",
                    "orderable":      false,
                    "searchable":     false,
                    "width":          "21px",
                    "defaultContent": ""
                },
                {
                    "data":           null,
                    "className":      "download_control",
                    "orderable":      false,
                    "searchable":     false,
                    "width":          "21px",
                    "defaultContent": ""
                },
                {
                    "data":           "ldt_name",
                    "defaultContent": "(nameless)"
                },
                {
                    "data":           "ldt_skills",
                    "defaultContent": "(none)"
                },
                {
                    "data":           "ldt_perk",
                    "defaultContent": "(none)"
                },
                {
                    "data":           "ldt_primary",
                    "defaultContent": "(none)"
                },
                {
                    "data":           "ldt_secondary",
                    "defaultContent": "(none)"
                },
                {
                    "data":           "ldt_melee",
                    "defaultContent": "(none)"
                },
                {
                    "data":           "ldt_throwable",
                    "defaultContent": "(none)"
                },
                {
                    "data":           "ldt_armor",
                    "defaultContent": "(none)"
                },
                {
                    "data":           "ldt_deployables",
                    "defaultContent": "(none)"
                },
                {
                    "data":           "ldt_risk",
                    "defaultContent": "-"
                },
                {
                    "data":           "ldt_dlcs",
                    "defaultContent": "(base)"
                }
            ],
            "createdRow":     function ( row, data, index )
            {
                $( row ).find( "td.url_control" ).html( "<a href=\"/l/" + data.data.ldt_hash + "\" target=\"_blank\" title=\"Link\"><span class=\"glyphicon glyphicon-link\" aria-hidden=\"true\"></span></a>" );

                $( row ).find( "td.download_control" ).html( "<a href=\"/dl/" + data.data.ldt_hash + "\" title=\"Download\"><span class=\"glyphicon glyphicon-cloud-download\" aria-hidden=\"true\"></span></a>" );

                if ( data.data.ldt_primary )
                {
                    $( "td", row ).eq( 6 ).addClass( "panel_toggle" ).on( "click", function ()
                    {
                        Weapons._displayPanel( data.data.ldt_primary, data.data.ldt_primary_blueprint, data.data.ldt_skills, data.data.ldt_perk );
                    } );
                }

                if ( data.data.ldt_secondary )
                {
                    $( "td", row ).eq( 7 ).addClass( "panel_toggle" ).on( "click", function ()
                    {
                        Weapons._displayPanel( data.data.ldt_secondary, data.data.ldt_secondary_blueprint, data.data.ldt_skills, data.data.ldt_perk );
                    } );
                }

                if ( data.data.ldt_dlcs )
                {
                    $( "td", row ).eq( 13 ).addClass( "panel_toggle" ).on( "click", function ()
                    {
                        Loadout._displayDLCPanel( data.data.ldt_hash );
                    } );
                }
            },
            "dom":            "<Bf<tr>>",
            "language":       {
                "info":         "Showing _START_ to _END_ of _TOTAL_ available loadouts",
                "infoEmpty":    "Showing 0 to 0 of 0 available loadouts",
                "infoFiltered": "(filtered from _MAX_ total available loadouts)",
                "processing":   "<div id=\"loading\"><img src=\"/img/loading.gif\"/><br/><br/>PRESS NOTHING TO INTERACT</div>",
                "select":       {
                    "rows": {
                        "_": "%d loadouts selected",
                        "0": "",
                        "1": "%d loadout selected"
                    }
                },
                "zeroRecords":  "No matching available loadouts found"
            },
            "order":          [
                [ 3, "asc" ]
            ],
            "paging":         false,
            "processing":     true,
            "scrollCollapse": true,
            "scrollX":        true,
            "scrollY":        "370px",
            "select":         {
                style:    "single",
                selector: "td:first-child"
            }
        } );
    },

    _panel:         function ( params )
    {
        var panel = $( "#panel" );

        panel.html( "<div id=\"panel_loading\"><img src=\"/img/loading.gif\"/><br/><br/>PRESS NOTHING TO INTERACT</div>" );

        //noinspection JSUnusedLocalSymbols,JSUnusedLocalSymbols
        var slider = panel.slideReveal(
            {
                hidden:       function ( slider, trigger )
                {
                    $( ".slide-reveal-overlay" ).remove();
                },
                overlay:      true,
                overlayColor: "rgba(0,0,0,0.85)",
                position:     "right",
                push:         false,
                width:        500
            } );

        slider.slideReveal( "show" );

        $.post( "/api.php", params, "json" ).done( function ( data )
        {
            data = JSON && JSON.parse( data ) || $.parseJSON( data );

            if ( data.success )
            {
                panel.html( data.data );
            }
            else
            {
                panel.html( "<h4 class=\"col-xs-12\">Oh noes... something seems to be wrong, please try again later :(</h4>");
            }
        } );
    },

    _perks:         function ()
    {
        $( ".pk_scroll" ).slimScroll( { height: 603, color: "#fff" } );

        $( ".pk_sprite li" ).hover( function ()
        {
            $( "#pk_details" ).html( $( this ).data( "details" ) );

        }, function ()
        {
            $( "#pk_details" ).html( "Hover a perk deck to see its description." );
        } );

        $( ".pk_item" ).on( "click", Perks._eventSelectOn )
            .on( "contextmenu", Perks._eventSelectOff )
            .hover( Perks._eventHoverOn, Perks._eventHoverOff );

        Perks._eventInit();
    },

    _skills:        function ()
    {
        $( ".sk_subtree" ).hover( function ()
        {
            $( this ).find( ".sk_tiers_cost" ).css( "visibility", "visible" );

            $( ".sk_container" ).find( "#" + $( this ).attr( "id" ) + "_name" ).css( "color", "#fff" );
        }, function ()
        {
            $( this ).find( ".sk_tiers_cost" ).css( "visibility", "hidden" );

            $( ".sk_container" ).find( "#" + $( this ).attr( "id" ) + "_name" ).css( "color", "#005581" );
        } );

        $( ".sk_tier" ).hover( function ()
        {
            var _elem = $( this ).find( ".sk_tier_cost" );

            if ( _elem.find( "span" ).first().html() != "000" )
            {
                _elem.css( "visibility", "visible" );
            }
        }, function ()
        {
            $( this ).find( ".sk_tier_cost" ).css( "visibility", "hidden" );
        } );

        $( ".sk_sprite" ).hover( function ()
        {
            $( this ).next().css( "visibility", "visible" );

            var _tree = $( "#skills" ).find( "ul li.active" ).text().toLowerCase();

            $( "#sk_" + _tree + "_details" ).html( $( this ).find( "li span" ).html() );

        }, function ()
        {
            $( this ).next().css( "visibility", "hidden" );

            var _tree = $( "#skills" ).find( "ul li.active" ).text().toLowerCase();

            $( "#sk_" + _tree + "_details" ).html( "Hover a skill to see its description." );
        } );

        $( ".sk_sprite li" ).on( "click", Skills._eventAdd ).on( "contextmenu", Skills._eventRemove );

        $( ".sk_refund" ).on( "click", Skills._eventRefund );

        Skills._eventInit();
    },

    _tabs:          function ()
    {
        $( "a[data-toggle=\"tab\"]" ).on( "shown.bs.tab", function ( e )
        {
            Page._footer();

            $.fn.dataTable.tables( { visible: true, api: true } ).columns.adjust();

            var _tab = $( e.target ).attr( "href" );

            if ( Page.tabs.indexOf( _tab ) === -1 )
            {
                Page.tabs.push( _tab );

                if ( _tab == "#tab_cat_perks")
                {
                    var _margin = Math.floor( ( ( $( ".pk_container" ).width() / 9 ) - 48 ) / 2 );

                    $( ".pk_sprite" ).find( "li" ).css( "margin", "20px " + ( _margin > 20 ? _margin + "px" : "" ) );
                }
                else if ( _tab == "#tab_throwable" )
                {
                    $( "#thrw_details" ).css( "height", $( ".thrw_container" ).height() + 32 );
                }
                else if ( _tab == "#tab_cat_armors" )
                {
                    var _height = $( ".arm_container" ).height() - 74;

                    $( "#arm_details" ).css( "height", _height >= 422 ? _height : "422" );
                }
                else if ( _tab == "#tab_cat_deployables" )
                {
                    $( "#dpl_details" ).css( "height", $( ".dpl_container" ).height() + 32 );
                }
            }

            var _position;

            if ( $( "#perks" ).is( ":visible" ) )
            {
                _position = $( ".pk_selected" ).position();

                if ( _position && ( _position.top >= 603 ) )
                {
                    $( ".pk_scroll" ).slimScroll( { scrollTo: _position.top }  );
                }
            }
            else if ( $( "#melee" ).is( ":visible" ) )
            {
                _position = $( Weapons.tables.melee.row( { selected: true } ).node() ).position();

                if ( _position && ( _position.top >= 370 ) )
                {
                    $( "#melee_wrapper" ).find( ".dataTables_scrollBody" ).scrollTop( _position.top );
                }
            }
            else
            {
                for ( var _table in Weapons.tables.weapons )
                {
                    if ( Weapons.tables.weapons.hasOwnProperty( _table ) )
                    {
                        if ( $( "#" + _table ).is( ":visible" ) )
                        {
                            _position = $( Weapons.tables.weapons[ _table ].row( { selected: true } ).node() ).position();

                            if ( _position && ( _position.top >= 370 ) )
                            {
                                $( "#" + _table + "_wrapper" ).find( ".dataTables_scrollBody" ).scrollTop( _position.top );
                            }
                        }
                    }
                }
            }
        } );

        $( "[data-toggle=\"tooltip\"]" ).tooltip( { placement: "bottom" } );
    },

    _throwables:    function ()
    {
        $( ".thrw_item" ).on( "click", Throwables._eventSelectOn )
            .on( "contextmenu", Throwables._eventSelectOff )
            .hover( Throwables._eventHoverOn, Throwables._eventHoverOff );

        Throwables._eventInit();
    },

    _weapons:       function ()
    {
        $( "#weapons" ).find( "[id^=wp_]" ).each( function ()
        {
            var table = this;
            var wid   = this.id;

            //noinspection JSUnusedLocalSymbols
            Weapons.tables.weapons[ wid ] = $( table ).DataTable( {
                "autoWidth":      false,
                "buttons":        [
                    {
                        "text":      "<span class=\"glyphicon glyphicon-refresh\" aria-hidden=\"true\"></span> Refresh",
                        "className": "btn-primary",
                        "action":    function ( e, dt, node, config )
                        {
                            Weapons._updateStats( "table", Weapons.tables.weapons[ wid ], e );
                        }
                    },
                    {
                        "extend":    "selected",
                        "text":      "<span class=\"glyphicon glyphicon-cog\" aria-hidden=\"true\"></span> Attachments",
                        "className": "btn-primary",
                        "action":    function ( e, dt, node, config )
                        {
                            Weapons._displayMods( wid );
                        }
                    }
                ],
                "columns":        [
                    {
                        "data":           null,
                        "className":      "select-checkbox",
                        "orderable":      false,
                        "searchable":     false,
                        "defaultContent": "",
                        "width":          "2%"
                    },
                    {
                        "data":           null,
                        "className":      "wp_blueprint_control",
                        "orderable":      false,
                        "searchable":     false,
                        "defaultContent": "",
                        "width":          "2%"
                    },
                    {
                        "data":  "loc_text",
                        "width": "25%"
                    },
                    {
                        "data":  "wp_clip",
                        "width": "5%"
                    },
                    {
                        "data":  "wp_ammo",
                        "width": "5%"
                    },
                    {
                        "data":  "wp_rof",
                        "width": "5%"
                    },
                    {
                        "data":  "wp_dmg",
                        "width": "5%"
                    },
                    {
                        "data":  "wp_acc",
                        "width": "5%"
                    },
                    {
                        "data":  "wp_stb",
                        "width": "5%"
                    },
                    {
                        "data":  "wp_cc",
                        "width": "5%"
                    },
                    {
                        "data":  "wp_thr",
                        "width": "5%"
                    },
                    {
                        "data":  "wp_rs",
                        "width": "5%"
                    },
                    {
                        "data":  "wp_dps",
                        "width": "5%"
                    },
                    {
                        "data":           "dlc_name",
                        "defaultContent": "(base)",
                        "width":          "21%"
                    }
                ],
                "createdRow":     function ( row, data, index )
                {
                    Weapons.blueprint[ data.wp_factory_id ] = data.wp_blueprint;
                    Weapons.crafted[ data.wp_factory_id ]   = data.wp_crafted;

                    $( row ).find( ".wp_blueprint_control" ).html( "<span class=\"glyphicon glyphicon-triangle-bottom color_positive\" data-toggle=\"tooltip\" data-original-title=\"Blueprint\" aria-hidden=\"true\"></span>" );
                    $( row ).find( ".wp_blueprint_control>span" ).tooltip( { placement: "right" } );

                    $( "td", row ).eq( 2 ).addClass( "panel_toggle" ).on( "click", function ()
                    {
                        Weapons._displayPanel( data.wp_factory_id, Weapons.crafted[ data.wp_factory_id ], Skills.selected, $( ".pk_selected" ).data( "id" ) );
                    } );

                    for ( var _i_ = 0, _columns = [ 3, 4, 5, 6, 7, 8, 9, 10, 11, 12 ], _l_ = _columns.length; _i_ < _l_; _i_++ )
                    {
                        $( "td", row ).eq( _columns[ _i_ ] ).removeClass( "color_max color_positive color_negative color_normal" ).addClass( data.colors[ _columns[ _i_ ] ] );
                    }

                    $( "td", row ).eq( 13 ).addClass( Loadout._formatDLC( data.dlc_name ) );
                },
                "dom":            "<Bf<tr>>",
                "drawCallback":   function ()
                {
                    this.api().columns( 13 ).every( function ()
                    {
                        var column = this;

                        var select = $( "<select class=\"form-control\"><option value=\"\"></option></select>" ).appendTo( $( this.footer() ).empty() )
                            .on( "change", function ()
                            {
                                var val = $.fn.dataTable.util.escapeRegex( $( this ).val() );
                                column.search( val ? val : "", true, false ).draw();
                            } );

                        var _data = [];

                        //noinspection JSUnusedLocalSymbols
                        column.data().each( function ( d, j )
                        {
                            var _packs = d.split( ", " );

                            for ( var _i_ = 0, _l_ = _packs.length; _i_ < _l_; _i_++ )
                            {
                                if ( _data.indexOf( _packs[ _i_ ] ) === -1 )
                                {
                                    _data.push( _packs[ _i_ ] );
                                }
                            }
                        } );

                        _data.sort();

                        for ( var _i_ = 0, _l_ = _data.length; _i_ < _l_; _i_++ )
                        {
                            var _selected = ( column.search().replace( /\\/g, "" ) === _data[ _i_ ] ? "selected" : "" );
                            select.append( "<option value=\"" + _data[ _i_ ] + "\" " + _selected + ">" + _data[ _i_ ] + "</option>" );
                        }
                    } );

                    //noinspection JSUnusedLocalSymbols
                    this.api().rows( function ( idx, data, node )
                    {
                        if ( data.selected && wid.indexOf( "all" ) !== -1 )
                        {
                            data.selected = false;

                            $( "a[href=#tab_wp_0_" + data.wp_slot + "]" ).tab( "show" );

                            return true;
                        }
                    } ).select();
                },
                "language":       {
                    "info":         "Showing _START_ to _END_ of _TOTAL_ available weapons",
                    "infoEmpty":    "Showing 0 to 0 of 0 available weapons",
                    "infoFiltered": "(filtered from _MAX_ total available weapons)",
                    "processing":   "<div id=\"loading\"><img src=\"/img/loading.gif\"/><br/><br/>PRESS NOTHING TO INTERACT</div>",
                    "select":       {
                        "rows": {
                            "_": "%d weapons selected",
                            "0": "",
                            "1": "%d weapon selected"
                        }
                    },
                    "zeroRecords":  "No matching available weapons found"
                },
                "order":          [
                    [ 2, "asc" ]
                ],
                "paging":         false,
                "processing":     true,
                "scrollCollapse": true,
                "scrollX":        true,
                "scrollY":        "370px",
                "select":         {
                    style:    "single",
                    selector: "td:first-child"
                }
            } );

            $( table ).on( "click", ".wp_blueprint_control", function ()
            {
                var tr   = $( this ).closest( "tr" );
                var row  = Weapons.tables.weapons[ wid ].row( tr );
                var data = row.data();

                if ( row.child.isShown() )
                {
                    row.child.hide();
                    tr.removeClass( "shown" );
                    $( this ).html( "<span class=\"glyphicon glyphicon-triangle-bottom color_positive\" data-toggle=\"tooltip\" data-original-title=\"Blueprint\" aria-hidden=\"true\"></span>" );
                    $( this ).tooltip( { placement: "right" } );
                }
                else
                {
                    row.child( Weapons._displayBlueprint( Weapons.crafted[ data.wp_factory_id ], wid ) ).show();
                    tr.addClass( "shown" );
                    $( this ).html( "<span class=\"glyphicon glyphicon-triangle-top color_negative\" data-toggle=\"tooltip\" data-original-title=\"Blueprint\" aria-hidden=\"true\"></span>" );
                    $( this ).tooltip( { placement: "right" } );
                }
            } );

            Weapons.tables.weapons[ wid ].on( "select", function ( e, dt, type, indexes )
            {
                if ( type !== "row" || Weapons.target )
                {
                    return;
                }

                //noinspection JSUnusedAssignment
                Weapons.target = true;

                var _weapon = dt.row( indexes ).data();

                for ( var id in Weapons.tables.weapons )
                {
                    if ( Weapons.tables.weapons.hasOwnProperty( id ) )
                    {
                        if ( id.indexOf( _weapon.wp_slot ) !== -1 && id != wid )
                        {
                            Weapons.tables.weapons[ id ].rows().deselect();
                        }
                    }
                }

                //noinspection JSUnusedLocalSymbols
                Weapons.tables.weapons[ "wp_" + _weapon.wp_slot + "_" + ( wid.indexOf( "all" ) !== -1 ? _weapon.wp_category : "all" ) ].rows( function ( idx, data, node )
                {
                    return data.wp_factory_id === _weapon.wp_factory_id;
                } ).select();

                Armors._eventChangeMisc();
                Loadout._updateRisk();

                Weapons.target = "";
            } );

            Weapons.tables.weapons[ wid ].on( "deselect", function ( e, dt, type, indexes )
            {
                if ( type !== "row" || Weapons.target )
                {
                    return;
                }

                //noinspection JSUnusedAssignment
                Weapons.target = wid;

                if ( indexes.length == 1 )
                {
                    var _weapon = dt.row( indexes ).data();

                    //noinspection JSUnusedLocalSymbols
                    Weapons.tables.weapons[ "wp_" + _weapon.wp_slot + "_" + ( wid.indexOf( "all" ) != -1 ? _weapon.wp_category : "all" ) ].rows( function ( idx, data, node )
                    {
                        return data.wp_factory_id === _weapon.wp_factory_id;
                    } ).deselect();
                }

                Armors._eventChangeMisc();
                Loadout._updateRisk();

                Weapons.target = "";
            } );
        } );

        $( "#mods" ).find( "[id^=mod_]" ).each( function ()
        {
            var table = this;
            var mid   = this.id;

            var _select   = {};
            var _columns  = [];
            var _stats    = [];
            var _values   = [];
            var _indexes  = [];
            var _order    = [];
            var _language = [];

            if ( mid == "mod_all" )
            {
                _select   = {
                    style:    "multi",
                    selector: "td:first-child"
                };
                _columns  = [
                    {
                        "data":           null,
                        "className":      "select-checkbox",
                        "orderable":      false,
                        "searchable":     false,
                        "defaultContent": "",
                        "width":          "2%"
                    },
                    {
                        "data":           null,
                        "className":      "wp_blueprint_control",
                        "orderable":      false,
                        "searchable":     false,
                        "defaultContent": "",
                        "width":          "2%"
                    },
                    {
                        "data":           null,
                        "className":      "wp_rules_control",
                        "orderable":      false,
                        "searchable":     false,
                        "defaultContent": "",
                        "width":          "2%"
                    },
                    {
                        "data":           "loc_text",
                        "defaultContent": "(nameless)",
                        "name":           "name",
                        "width":          "21%"
                    },
                    {
                        "data":  "mod_clip_i",
                        "width": "6%"
                    },
                    {
                        "data":  "mod_clip_v",
                        "width": "6%"
                    },
                    {
                        "data":  "mod_ammo_i",
                        "width": "6%"
                    },
                    {
                        "data":  "mod_ammo_v",
                        "width": "6%"
                    },
                    {
                        "data":  "mod_rof_i",
                        "width": "6%"
                    },
                    {
                        "data":  "mod_rof_v",
                        "width": "6%"
                    },
                    {
                        "data":  "mod_dmg_i",
                        "width": "6%"
                    },
                    {
                        "data":  "mod_dmg_v",
                        "width": "6%"
                    },
                    {
                        "data":  "mod_acc_i",
                        "width": "6%"
                    },
                    {
                        "data":  "mod_acc_v",
                        "width": "6%"
                    },
                    {
                        "data":  "mod_stb_i",
                        "width": "6%"
                    },
                    {
                        "data":  "mod_stb_v",
                        "width": "6%"
                    },
                    {
                        "data":  "mod_cc_i",
                        "width": "6%"
                    },
                    {
                        "data":  "mod_cc_v",
                        "width": "6%"
                    },
                    {
                        "data":  "mod_thr_i",
                        "width": "6%"
                    },
                    {
                        "data":  "mod_thr_v",
                        "width": "6%"
                    },
                    {
                        "data":  "mod_rs_i",
                        "width": "6%"
                    },
                    {
                        "data":  "mod_rs_v",
                        "name":  "RS",
                        "width": "6%"
                    },
                    {
                        "data":  "mod_type",
                        "width": "6%"
                    },
                    {
                        "data":           "dlc_name",
                        "defaultContent": "(base)",
                        "name":           "DLC",
                        "width":          "13%"
                    }
                ];
                _stats    = [
                    4,
                    5,
                    6,
                    7,
                    8,
                    9,
                    10,
                    11,
                    12,
                    13,
                    14,
                    15,
                    16,
                    17,
                    18,
                    19,
                    20,
                    21
                ];
                _values   = [
                    5,
                    7,
                    9,
                    11,
                    13,
                    15,
                    17,
                    19,
                    21
                ];
                _indexes  = [
                    4,
                    6,
                    8,
                    10,
                    12,
                    14,
                    16,
                    18,
                    20
                ];
                _order    = [
                    [
                        3,
                        "asc"
                    ]
                ];
                _language = {
                    "info":         "Showing _START_ to _END_ of _TOTAL_ available mods",
                    "infoEmpty":    "Showing 0 to 0 of 0 available mods",
                    "infoFiltered": "(filtered from _MAX_ total available mods)",
                    "processing":   "<div id=\"loading\"><img src=\"/img/loading.gif\"/><br/><br/>PRESS NOTHING TO INTERACT</div>",
                    "select":       {
                        "rows": {
                            "_": "%d mods selected",
                            "0": "",
                            "1": "%d mod selected"
                        }
                    },
                    "zeroRecords":  "No matching available mods found"
                };
            }
            else if ( mid == "mod_skin" )
            {
                _select   = {
                    style:    "single",
                    selector: "td:first-child"
                };
                _columns  = [
                    {
                        "data":           null,
                        "className":      "select-checkbox",
                        "orderable":      false,
                        "searchable":     false,
                        "defaultContent": "",
                        "width":          "2%"
                    },
                    {
                        "data":           null,
                        "className":      "wp_blueprint_control",
                        "orderable":      false,
                        "searchable":     false,
                        "defaultContent": "",
                        "width":          "2%"
                    },
                    {
                        "data":           null,
                        "className":      "wp_rules_control",
                        "orderable":      false,
                        "searchable":     false,
                        "defaultContent": "",
                        "width":          "2%"
                    },
                    {
                        "data":           "loc_text",
                        "defaultContent": "(nameless)",
                        "name":           "name",
                        "width":          "21%"
                    },
                    {
                        "data":  "mod_clip_i",
                        "width": "6%"
                    },
                    {
                        "data":  "mod_clip_v",
                        "width": "6%"
                    },
                    {
                        "data":  "mod_ammo_i",
                        "width": "6%"
                    },
                    {
                        "data":  "mod_ammo_v",
                        "width": "6%"
                    },
                    {
                        "data":  "mod_rof_i",
                        "width": "6%"
                    },
                    {
                        "data":  "mod_rof_v",
                        "width": "6%"
                    },
                    {
                        "data":  "mod_dmg_i",
                        "width": "6%"
                    },
                    {
                        "data":  "mod_dmg_v",
                        "width": "6%"
                    },
                    {
                        "data":  "mod_acc_i",
                        "width": "6%"
                    },
                    {
                        "data":  "mod_acc_v",
                        "width": "6%"
                    },
                    {
                        "data":  "mod_stb_i",
                        "width": "6%"
                    },
                    {
                        "data":  "mod_stb_v",
                        "width": "6%"
                    },
                    {
                        "data":  "mod_cc_i",
                        "width": "6%"
                    },
                    {
                        "data":  "mod_cc_v",
                        "width": "6%"
                    },
                    {
                        "data":  "mod_thr_i",
                        "width": "6%"
                    },
                    {
                        "data":  "mod_thr_v",
                        "width": "6%"
                    },
                    {
                        "data":  "mod_rs_i",
                        "width": "6%"
                    },
                    {
                        "data":  "mod_rs_v",
                        "name":  "RS",
                        "width": "6%"
                    },
                    {
                        "data":           "dlc_name",
                        "defaultContent": "(base)",
                        "name":           "DLC",
                        "width":          "19%"
                    }
                ];
                _stats    = [
                    4,
                    5,
                    6,
                    7,
                    8,
                    9,
                    10,
                    11,
                    12,
                    13,
                    14,
                    15,
                    16,
                    17,
                    18,
                    19,
                    20,
                    21
                ];
                _values   = [
                    5,
                    7,
                    9,
                    11,
                    13,
                    15,
                    17,
                    19,
                    21
                ];
                _indexes  = [
                    4,
                    6,
                    8,
                    10,
                    12,
                    14,
                    16,
                    18,
                    20
                ];
                _order    = [
                    [
                        3,
                        "asc"
                    ]
                ];
                _language = {

                    "info":         "Showing _START_ to _END_ of _TOTAL_ available skins",
                    "infoEmpty":    "Showing 0 to 0 of 0 available skins",
                    "infoFiltered": "(filtered from _MAX_ total available skins)",
                    "processing":   "<div id=\"loading\"><img src=\"/img/loading.gif\"/><br/><br/>PRESS NOTHING TO INTERACT</div>",
                    "select":       {
                        "rows": {
                            "_": "%d skins selected",
                            "0": "",
                            "1": "%d skin selected"
                        }
                    },
                    "zeroRecords":  "No matching available skins found"
                };
            }
            else
            {
                _select   = {
                    style:    "single",
                    selector: "td:first-child"
                };
                _columns  = [
                    {
                        "data":           null,
                        "className":      "select-checkbox",
                        "orderable":      false,
                        "searchable":     false,
                        "defaultContent": "",
                        "width":          "2%"
                    },
                    {
                        "data":           null,
                        "className":      "wp_rules_control",
                        "orderable":      false,
                        "searchable":     false,
                        "defaultContent": "",
                        "width":          "2%"
                    },
                    {
                        "data":           "loc_text",
                        "defaultContent": "(nameless)",
                        "width":          "21%"
                    },
                    {
                        "data":  "mod_clip_i",
                        "width": "6%"
                    },
                    {
                        "data":  "mod_clip_v",
                        "width": "6%"
                    },
                    {
                        "data":  "mod_ammo_i",
                        "width": "6%"
                    },
                    {
                        "data":  "mod_ammo_v",
                        "width": "6%"
                    },
                    {
                        "data":  "mod_rof_i",
                        "width": "6%"
                    },
                    {
                        "data":  "mod_rof_v",
                        "width": "6%"
                    },
                    {
                        "data":  "mod_dmg_i",
                        "width": "6%"
                    },
                    {
                        "data":  "mod_dmg_v",
                        "width": "6%"
                    },
                    {
                        "data":  "mod_acc_i",
                        "width": "6%"
                    },
                    {
                        "data":  "mod_acc_v",
                        "width": "6%"
                    },
                    {
                        "data":  "mod_stb_i",
                        "width": "6%"
                    },
                    {
                        "data":  "mod_stb_v",
                        "width": "6%"
                    },
                    {
                        "data":  "mod_cc_i",
                        "width": "6%"
                    },
                    {
                        "data":  "mod_cc_v",
                        "width": "6%"
                    },
                    {
                        "data":  "mod_thr_i",
                        "width": "6%"
                    },
                    {
                        "data":  "mod_thr_v",
                        "width": "6%"
                    },
                    {
                        "data":  "mod_rs_i",
                        "width": "6%"
                    },
                    {
                        "data":  "mod_rs_v",
                        "name":  "RS",
                        "width": "6%"
                    },
                    {
                        "data":           "dlc_name",
                        "defaultContent": "(base)",
                        "name":           "DLC",
                        "width":          "21%"
                    }
                ];
                _stats    = [
                    3,
                    4,
                    5,
                    6,
                    7,
                    8,
                    9,
                    10,
                    11,
                    12,
                    13,
                    14,
                    15,
                    16,
                    17,
                    18,
                    19,
                    20
                ];
                _values   = [
                    4,
                    6,
                    8,
                    10,
                    12,
                    14,
                    16,
                    18,
                    20
                ];
                _indexes  = [
                    3,
                    5,
                    7,
                    9,
                    11,
                    13,
                    15,
                    17,
                    19
                ];
                _order    = [
                    [
                        2,
                        "asc"
                    ]
                ];
                _language = {

                    "info":         "Showing _START_ to _END_ of _TOTAL_ available mods",
                    "infoEmpty":    "Showing 0 to 0 of 0 available mods",
                    "infoFiltered": "(filtered from _MAX_ total available mods)",
                    "processing":   "<div id=\"loading\"><img src=\"/img/loading.gif\"/><br/><br/>PRESS NOTHING TO INTERACT</div>",
                    "select":       {
                        "rows": {
                            "_": "%d mods selected",
                            "0": "",
                            "1": "%d mod selected"
                        }
                    },
                    "zeroRecords":  "No matching available mods found"
                };
            }

            //noinspection JSUnusedLocalSymbols,JSUnusedLocalSymbols,JSUnusedLocalSymbols
            Weapons.tables.mods[ mid ] = $( table ).DataTable( {
                "autoWidth":      false,
                "buttons":        [
                    {
                        "extend": "colvisGroup",
                        "text":   "Indexes",
                        "show":   _indexes,
                        "hide":   _values
                    },
                    {
                        "extend": "colvisGroup",
                        "text":   "Values",
                        "show":   _values,
                        "hide":   _indexes
                    }
                ],
                "columnDefs":     [
                    {
                        "targets":     _stats,
                        "createdCell": function ( td, cellData, rowData, row, col )
                        {
                            var _invert = col == this.api().column( "RS:name" ).index();

                            if ( cellData > 0 )
                            {
                                $( td ).html( cellData.toString().replace( /^(\d)/g, "+$1" ) );
                                $( td ).addClass( !_invert ? "color_positive" : "color_negative" );
                            }
                            else if ( cellData < 0 )
                            {
                                $( td ).addClass( !_invert ? "color_negative" : "color_positive" );
                            }
                        }
                    },
                    {
                        "targets": _indexes,
                        "visible": false
                    }
                ],
                "columns":        _columns,
                "dom":            "<Bf<tr>>",
                "drawCallback":   function ()
                {

                    var table = this;
                    var dlc   = this.api().column( "DLC:name" ).index();

                    table.api().rows( function ( idx, data, node )
                    {
                        if ( data.mod_blueprint )
                        {
                            $( node ).find( ".wp_blueprint_control" ).html( "<span class=\"glyphicon glyphicon-triangle-bottom color_positive\" data-toggle=\"tooltip\" data-original-title=\"Blueprint\" aria-hidden=\"true\"></span>" );
                            $( node ).find( ".wp_blueprint_control>span" ).tooltip( { placement: "right" } );
                        }

                        if ( data.mod_rules )
                        {
                            $( node ).find( ".wp_rules_control" ).html( "" );

                            if ( data.mod_rules.forbids )
                            {
                                $( node ).find( ".wp_rules_control" ).append( "&nbsp;<span class=\"glyphicon glyphicon-ban-circle color_negative\" data-toggle=\"tooltip\" data-original-title=\"Incompatibilities\" aria-hidden=\"true\"></span>" );
                                $( node ).find( ".wp_rules_control>span" ).tooltip( { placement: "right" } );
                            }

                            if ( data.mod_rules.depends_on )
                            {
                                $( node ).find( ".wp_rules_control" ).append( "&nbsp;<span class=\"glyphicon glyphicon-warning-sign color_dlc\" data-toggle=\"tooltip\" data-original-title=\"Requirements\" aria-hidden=\"true\"></span>" );
                                $( node ).find( ".wp_rules_control>span" ).tooltip( { placement: "right" } );

                                if ( !data.mod_rules.immune )
                                {
                                    $( node ).closest( "tr" ).addClass( "disabled" );
                                }
                            }

                            if ( data.mod_rules.adds )
                            {
                                $( node ).find( ".wp_rules_control" ).append( "&nbsp;<span class=\"glyphicon glyphicon-plus-sign color_positive\" data-toggle=\"tooltip\" data-original-title=\"Incompatibilities\" aria-hidden=\"true\"></span>" );
                                $( node ).find( ".wp_rules_control>span" ).tooltip( { placement: "right" } );
                            }

                            if ( data.mod_rules.locked )
                            {
                                $( node ).find( ".wp_rules_control" ).append( "&nbsp;<span class=\"glyphicon glyphicon-lock color_base\" data-toggle=\"tooltip\" data-original-title=\"Locked\" aria-hidden=\"true\"></span>" );
                                $( node ).find( ".wp_rules_control>span" ).tooltip( { placement: "right" } );
                            }
                        }

                        if ( data.mod_rarity )
                        {
                            table.api().cell( idx, table.api().column( "name:name" ).index() ).nodes().to$().addClass( "color_" + data.mod_rarity );
                        }

                        table.api().cell( idx, dlc ).nodes().to$().addClass( Loadout._formatDLC( data.dlc_name ) );
                    } );

                    table.api().column( "DLC:name" ).every( function ()
                    {
                        var column = this;

                        var select = $( "<select class=\"form-control\"><option value=\"\"></option></select>" ).appendTo( $( this.footer() ).empty() )
                            .on( "change", function ()
                            {
                                var val = $.fn.dataTable.util.escapeRegex( $( this ).val() );
                                column.search( val ? val : "", true, false ).draw();
                            } );

                        var _data = [];

                        //noinspection JSUnusedLocalSymbols
                        column.data().each( function ( d, j )
                        {
                            var _packs = d.split( ", " );

                            for ( var _i_ = 0, _l_ = _packs.length; _i_ < _l_; _i_++ )
                            {
                                if ( _data.indexOf( _packs[ _i_ ] ) === -1 )
                                {
                                    _data.push( _packs[ _i_ ] );
                                }
                            }
                        } );

                        _data.sort();

                        for ( var _i_ = 0, _l_ = _data.length; _i_ < _l_; _i_++ )
                        {
                            var _selected = ( column.search().replace( /\\/g, "" ) === _data[ _i_ ] ? "selected" : "" );
                            select.append( "<option value=\"" + _data[ _i_ ] + "\" " + _selected + ">" + _data[ _i_ ] + "</option>" );
                        }
                    } );
                },
                "language":       _language,
                "order":          _order,
                "paging":         false,
                "processing":     true,
                "scrollCollapse": true,
                "scrollX":        true,
                "scrollY":        "370px",
                "select":         _select
            } );

            if ( mid == "mod_all" || mid == "mod_skin" )
            {
                $( table ).on( "click", ".wp_blueprint_control", function ()
                {
                    var tr   = $( this ).closest( "tr" );
                    var row  = Weapons.tables.mods[ mid ].row( tr );
                    var data = row.data();

                    if ( data.mod_blueprint )
                    {
                        if ( row.child.isShown() )
                        {
                            row.child.hide();
                            tr.removeClass( "shown" );
                            $( this ).html( "<span class=\"glyphicon glyphicon-triangle-bottom color_positive\" data-toggle=\"tooltip\" data-original-title=\"Blueprint\" aria-hidden=\"true\"></span>" );
                            $( this ).tooltip( { placement: "right" } );
                        }
                        else
                        {
                            row.child( Weapons._displayBlueprint( data.mod_blueprint, mid ) ).show();
                            tr.addClass( "shown" );
                            $( this ).html( "<span class=\"glyphicon glyphicon-triangle-top color_negative\" data-toggle=\"tooltip\" data-original-title=\"Blueprint\" aria-hidden=\"true\"></span>" );
                            $( this ).tooltip( { placement: "right" } );
                        }
                    }
                } );
            }

            $( table ).on( "click", ".wp_rules_control", function ()
            {
                var tr  = $( this ).closest( "tr" );
                var row = Weapons.tables.mods[ mid ].row( tr );

                var _html = ( row.data().mod_rules ? Weapons._displayRules( row.data(), mid ) : false );

                if ( _html )
                {
                    if ( row.child.isShown() )
                    {
                        row.child.hide();
                        tr.removeClass( "shown" );
                    }
                    else
                    {
                        row.child( _html ).show();
                        tr.addClass( "shown" );
                    }
                }
            } );

            Weapons.tables.mods[ mid ].on( "select", function ( e, dt, type, indexes )
            {
                if ( type === "row" )
                {
                    var _selected = dt.rows( indexes ).data();

                    if ( $( dt.row( indexes ).node() ).closest( "tr" ).hasClass( "disabled" ) )
                    {
                        dt.row( indexes ).deselect( "!PROPAGATE" );

                        if ( $( "#" + mid + "_wrapper" + " .dataTables_message" ).length == 0 )
                        {
                            $( "#" + mid + "_filter" ).before( "<div class=\"alert alert-danger fade in dataTables_message\">" + "<button type=\"button\" class=\"close\" data-dismiss=\"alert\">&times;</button>" + "<strong>ERROR: </strong> This mod is not compatible with your current build. " + "&nbsp;</div>" );

                            $( "#" + mid + "_wrapper .dataTables_message" ).delay( 4000 ).fadeOut( 2000, function ()
                            {
                                $( this ).remove();
                            } );
                        }

                        return;
                    }

                    for ( var _i_ = 0, _l_ = _selected.length; _i_ < _l_; _i_++ )
                    {
                        (function ( _e_ )
                        {
                            if ( mid === "mod_all" )
                            {
                                //noinspection JSUnusedLocalSymbols
                                Weapons.tables.mods[ "mod_all" ].rows( function ( idx, data, node )
                                {
                                    if ( data.mod_type === _selected[ _e_ ].mod_type )
                                    {
                                        if ( data.mod_factory_id !== _selected[ _e_ ].mod_factory_id )
                                        {
                                            dt.row( idx ).deselect( "!PROPAGATE" );
                                        }
                                    }
                                } );
                            }

                            if ( _selected[ _i_ ].mod_blueprint )
                            {
                                for ( var _tid_ in Weapons.tables.mods )
                                {
                                    if ( Weapons.tables.mods.hasOwnProperty( _tid_ ) )
                                    {
                                        if ( _tid_ != "mod_all" && _tid_ != mid )
                                        {
                                            Weapons.tables.mods[ _tid_ ].rows().deselect( "!PROPAGATE" );
                                        }
                                    }
                                }

                                Weapons.tables.mods[ "mod_all" ].rows( function ( idx, data, node )
                                {
                                    $( node ).closest( "tr" ).removeClass( "disabled" );

                                    return data.mod_factory_id !== _selected[ _e_ ].mod_factory_id;
                                } ).deselect( "!PROPAGATE" );

                                for ( var _type_ in _selected[ _i_ ].mod_blueprint )
                                {
                                    if ( _selected[ _i_ ].mod_blueprint.hasOwnProperty( _type_ ) )
                                    {
                                        var _blueprint = [];

                                        for ( var _x_ = 0, _y_ = _selected[ _i_ ].mod_blueprint[ _type_ ].length; _x_ < _y_; _x_++ )
                                        {
                                            _blueprint.push( _selected[ _i_ ].mod_blueprint[ _type_ ][ _x_ ].mod_factory_id );
                                        }

                                        //noinspection JSUnusedLocalSymbols
                                        Weapons.tables.mods[ "mod_all" ].rows( function ( idx, data, node )
                                        {
                                            //noinspection LoopStatementThatDoesntLoopJS,LoopStatementThatDoesntLoopJS
                                            for ( var _x_ in _blueprint )
                                            {
                                                if ( _blueprint.hasOwnProperty( _x_ ) )
                                                {
                                                    return data.mod_factory_id === _blueprint[ _x_ ];
                                                }
                                            }
                                        } ).select( "!PROPAGATE" );

                                        //noinspection JSUnusedLocalSymbols
                                        Weapons.tables.mods[ "mod_" + ( Weapons.tables.mods[ "mod_" + _type_ ] ? _type_ : "special" ) ].rows( function ( idx, data, node )
                                        {
                                            //noinspection LoopStatementThatDoesntLoopJS
                                            for ( var _x_ in _blueprint )
                                            {
                                                if ( _blueprint.hasOwnProperty( _x_ ) )
                                                {
                                                    return data.mod_factory_id === _blueprint[ _x_ ];
                                                }
                                            }
                                        } ).select( "!PROPAGATE" );
                                    }
                                }
                            }

                            //noinspection JSUnusedLocalSymbols
                            Weapons.tables.mods[ "mod_" + ( mid == "mod_all" ? ( Weapons.tables.mods[ "mod_" + _selected[ _i_ ].mod_type_ ] ? _selected[ _i_ ].mod_type_ : "special" ) : "all" ) ].rows( function ( idx, data, node )
                            {
                                return data.mod_factory_id === _selected[ _e_ ].mod_factory_id;
                            } ).select( "!PROPAGATE" );

                            Weapons._updateBlueprint( _selected[ _i_ ], 1 );

                        })( _i_ );

                    }

                    Weapons._validateSelection();
                }
            } );

            Weapons.tables.mods[ mid ].on( "deselect", function ( e, dt, type, indexes )
            {
                if ( type === "row" )
                {
                    var _deselected = dt.rows( indexes ).data();

                    for ( var _i_ = 0, _l_ = _deselected.length; _i_ < _l_; _i_++ )
                    {
                        (function ( _e_ )
                        {
                            if ( _deselected[ _i_ ].mod_blueprint )
                            {
                                for ( var _tid_ in Weapons.tables.mods )
                                {
                                    if ( Weapons.tables.mods.hasOwnProperty( _tid_ ) )
                                    {
                                        Weapons.tables.mods[ _tid_ ].rows().deselect( "!PROPAGATE" );
                                    }
                                }
                            }

                            var _tid = ( mid == "mod_all" ? ( Weapons.tables.mods[ "mod_" + _deselected[ _i_ ].mod_type_ ] ? _deselected[ _i_ ].mod_type_ : "special" ) : "all" );

                            //noinspection JSUnusedLocalSymbols
                            Weapons.tables.mods[ "mod_" + _tid ].rows( function ( idx, data, node )
                            {
                                return data.mod_factory_id === _deselected[ _e_ ].mod_factory_id;
                            } ).deselect( "!PROPAGATE" );

                            Weapons._updateBlueprint( _deselected[ _i_ ], -1 );

                        })( _i_ );
                    }

                    Weapons._validateSelection();
                }
            } );

        } );

        $( "#wp_mods_close" ).on( "click", function ()
        {
            Armors._eventChangeMisc();
            Loadout._updateRisk();
            $( this ).parent().hide();
        } );

        //noinspection JSUnusedLocalSymbols
        Weapons.tables.melee = $( "#melee" ).DataTable( {
            "ajax":           {
                "url":  "/api.php",
                "type": "POST",
                "data": function ( post )
                {
                    post._ = "melee";
                    post.s = Skills.selected;
                    post.p = $( ".pk_selected" ).data( "id" );
                }
            },
            "autoWidth":      false,
            "buttons":        [
                {
                    "text":      "<span class=\"glyphicon glyphicon-refresh\" aria-hidden=\"true\"></span> Refresh",
                    "className": "btn-primary",
                    "action":    function ( e, dt, node, config )
                    {
                        $( dt.button( 0 ).node() ).addClass( "disabled ajax_primary" );

                        Weapons.tables.melee.ajax.reload();
                    }
                }
            ],
            "columns":        [
                {
                    "data":           null,
                    "className":      "select-checkbox",
                    "orderable":      false,
                    "searchable":     false,
                    "defaultContent": "",
                    "width":          "2%"
                },
                {
                    "data":  "loc_text",
                    "width": "20%"
                },
                {
                    "data":  "ml_dmg_min",
                    "width": "9%"
                },
                {
                    "data":  "ml_dmg_max",
                    "width": "9%"
                },
                {
                    "data":  "ml_kd_min",
                    "width": "8%"
                },
                {
                    "data":  "ml_kd_max",
                    "width": "8%"
                },
                {
                    "data":  "ml_ct",
                    "width": "6%"
                },
                {
                    "data":  "ml_rg",
                    "width": "6%"
                },
                {
                    "data":  "ml_cc",
                    "width": "6%"
                },
                {
                    "data":  "ml_type",
                    "width": "6%"
                },
                {
                    "data":           "dlc_name",
                    "defaultContent": "(base)",
                    "width":          "20%"
                }
            ],
            "createdRow":     function ( row, data, index )
            {
                for ( var _i_ = 0, _columns = [ 2, 3, 4, 5, 6, 7, 8 ], _l_ = _columns.length; _i_ < _l_; _i_++ )
                {
                    $( "td", row ).eq( _columns[ _i_ ] ).removeClass( "color_max color_positive color_negative color_normal" ).addClass( data.colors[ _columns[ _i_ ] ] );
                }

                $( "td", row ).eq( 10 ).addClass( Loadout._formatDLC( data.dlc_name ) );
            },
            "drawCallback":   function ()
            {
                this.api().columns( [ 9, 10 ] ).every( function ()
                {
                    var column = this;

                    var select = $( "<select class=\"form-control\"><option value=\"\"></option></select>" ).appendTo( $( this.footer() ).empty() )
                        .on( "change", function ()
                        {
                            var val = $.fn.dataTable.util.escapeRegex( $( this ).val() );
                            column.search( val ? val : "", true, false ).draw();
                        } );

                    var _data = [];

                    //noinspection JSUnusedLocalSymbols
                    column.data().each( function ( d, j )
                    {
                        var _packs = d.split( ", " );

                        for ( var _i_ = 0, _l_ = _packs.length; _i_ < _l_; _i_++ )
                        {
                            if ( _data.indexOf( _packs[ _i_ ] ) === -1 )
                            {
                                _data.push( _packs[ _i_ ] );
                            }
                        }
                    } );

                    _data.sort();

                    for ( var _i_ = 0, _l_ = _data.length; _i_ < _l_; _i_++ )
                    {
                        var _selected = ( column.search().replace( /\\/g, "" ) === _data[ _i_ ] ? "selected" : "" );
                        select.append( "<option value=\"" + _data[ _i_ ] + "\" " + _selected + ">" + _data[ _i_ ] + "</option>" );
                    }
                } );

                $( this.api().button( 0 ).node() ).removeClass( "disabled ajax_primary" );
            },
            "dom":            "<Bf<tr>>",
            "initComplete":   function ( settings, json )
            {
                if ( Weapons.selected.melee )
                {
                    //noinspection JSUnusedLocalSymbols
                    Weapons.tables.melee.rows( function ( idx, data, node )
                    {
                        return data.ml_factory_id === Weapons.selected.melee;
                    } ).select();
                }
            },
            "language":       {
                "info":         "Showing _START_ to _END_ of _TOTAL_ available melee weapons",
                "infoEmpty":    "Showing 0 to 0 of 0 available melee weapons",
                "infoFiltered": "(filtered from _MAX_ total available melee weapons)",
                "processing":   "<div id=\"loading\"><img src=\"/img/loading.gif\"/><br/><br/>PRESS NOTHING TO INTERACT</div>",
                "select":       {
                    "rows": {
                        "_": "%d melee weapons selected",
                        "0": "",
                        "1": "%d melee weapon selected"
                    }
                },
                "zeroRecords":  "No matching available melee weapons found"
            },
            "order":          [
                [ 1, "asc" ]
            ],
            "paging":         false,
            "processing":     true,
            "rowId":          "rowId",
            "scrollCollapse": true,
            "scrollX":        true,
            "scrollY":        "370px",
            "select":         {
                style:    "single",
                selector: "td:first-child"
            }
        } );

        //noinspection JSUnusedLocalSymbols
        Weapons.tables.melee.on( "select", function ( e, dt, type, indexes )
        {
            Armors._eventChangeMisc();
            Loadout._updateRisk();
        } );

        //noinspection JSUnusedLocalSymbols
        Weapons.tables.melee.on( "deselect", function ( e, dt, type, indexes )
        {
            Armors._eventChangeMisc();
            Loadout._updateRisk();
        } );

        Weapons._eventInit();
    }

};

$( Page._init );