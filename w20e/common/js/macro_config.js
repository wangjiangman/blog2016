(function(window) {
    var CONST = {
        CONFIG_NAT_SESSION_NUMBER: 65536,
        CONFIG_MAX_WAN_NUM: 2,
        CONFIG_MAX_DHCP_CLIENT: 256,
        CONFIG_DHCPS_STATIC_IP_NUM: 32,
        CONFIG_NET_MULTI_WAN: "y",
        CONFIG_PRODUCT: "W20E",
        CONFIG_CHIP_VENDER: "broadcom",
        CONFIG_CHIP_MODEL: "bcm4708",
        CONFIG_WIFICHIP_MODEL: "bcm4360_11acwl14.93",
        CONFIG_PROD: "y",
        PLATFORM_VERSION: "bcm4708_4x32_p10",
        CONFIG_NEW_NETCTRL: "y",
        CONFIG_WIFI: "y",
        CONFIG_WIFI_APSTA: "y",
        CONFIG_WIFI_AUTH_1X: "y",
        CONFIG_WIFI_EMF: "y",
        CONFIG_WIFI_2_4G: "y",
        CONFIG_2_4G_MAX_SSID_NUMBER: "4",
        CONFIG_WIFI_FILTER_NUMBER: "32",
        CONFIG_WIFI_FILTER_ADD_NUMBER: 5,
        CONFIG_WIFI_GUEST: "y",
        CONFIG_NET_WAN_STATIC: "y",
        CONFIG_NET_WAN_DHCP: "y",
        CONFIG_NET_DHCP: "y",
        CONFIG_NET_WAN_PPPOE: "y",
        CONFIG_PPPoE_SERVER: "y",
        CONFIG_PPPOE_USER_NUMBER: 100,
        CONFIG_PPPOE_WHITE_MAC_NUMBER: 20,
        CONFIG_PPPOE_WHITE_MAC_ADD_NUMBER: 5,
        CONFIG_ADVANCE_UPNP: "y",
        CONFIG_SYSTEM_SNTP: "y",
        CONFIG_ADVANCE_DDNS: "y",
        CONFIG_ADVANCE_DYNDNS: "y",
        CONFIG_ADVANCE_3322: "y",
        CONFIG_ADVANCE_88IP: "y",
        CONFIG_ADVANCE_ORAY: "y",
        CONFIG_ADVANCE_GNWAY: "y",
        CONFIG_ADVANCE_NOIP: "y",
        CONFIG_VPN: "y",
        CONFIG_VPN_CONNECT_NUMBER: 15,
        CONFIG_VPN_SERVER_USER_NUMBER: 20,
        CONFIG_VPN_SERVER_USER_ADD_NUMBER: 5,
        CONFIG_VPN_PPTP: "y",
        CONFIG_VPN_L2TP: "y",
        CONFIG_VPN_IPSEC: "y",
        CONFIG_IPSEC_NUMBER: 15,
        CONFIG_IGMPPROXY_SUPPORT: "y",
        CONFIG_BEHAVIOR_MANAGER: "y",
        CONFIG_GROUP_IP_NUMBER: 20,
        CONFIG_GROUP_TIMER_NUMBER: 10,
        CONFIG_FILTER_MAC_NUMBER: 100,
        CONFIG_FILTER_IPPORT_NUMBER: 20,
        CONFIG_FILTER_URL_NUMBER: 20,
        CONFIG_URL_GROUP_NUMBER: 10,
        CONFIG_GROUP_URL_NUMBER: 20,
        CONFIG_FILTER_APP_NUMBER: 20,
        CONFIG_FILTER_QQ_NUMBER: 20,
        CONFIG_FILTER_QQ_ADD_NUMBER: 5,
        CONFIG_WAN_POLICY_NUMBER: 20,
        CONFIG_BIND_IPMAC_NUMBER: 100,
        CONFIG_PRIVILEGE_IP: "y",
        CONFIG_ONLINE_IP: "y",
        CONFIG_APP_IDENTIFY: "y",
        CONFIG_QOS_RULE_NUMBER: 20,
        CONFIG_SAFE_ATTACK: "y",
        CONFIG_SAFE_ARP: "y",
        CONFIG_NET_CTL_WEB_ACCESS_LAN: "y",
        CONFIG_NET_CTL_WEB_ACCESS_WAN: "y",
        CONFIG_NET_PORT_CFG_WAN_NUMBER: "y",
        CONFIG_NET_PORT_CFG_MIRROR: "y",
        CONFIG_NET_PORT_CFG_PORT_LINK_MODE: "y",
        CONFIG_NET_PORT_CFG_MAC_CLONE: "y",
        CONFIG_NET_DMZ: "y",
        CONFIG_PORTAL_AUTH: "y",
        CONFIG_AUTH_RULE_NUMBER: 20,//不用认证的主机
        CONFIG_AUTH_ADD_NUMBER: 5,//一次性最多添加的不用认证的主机
        CONFIG_AUTH_USER_NUMBER: "100",//认证服务器用户最大数
        CONFIG_AUTH_USER_ADD_NUMBER: 5,//一次性最多添加的用户最大数
        CONFIG_ARP_GATEWAY: "y",
        CONFIG_NAT_SPEEDUP: "y",
        CONFIG_ADVANCE_VIRTUAL_SERVER: "y",
        CONFIG_MAX_PORT_MAP_NUM: 10,
        CONFIG_MAX_STATIC_ROUTE_NUM: 10,
        CONFIG_ROUTE_TABLE: "y",
        CONFIG_NET_GMAC: "y",
        CONFIG_FTP_SERVER: "y",
        CONFIG_FIRWARE_VERION: 'V15.01.0.8(2422_721)', 
        CONFIG_FIRWARE_DATE: "2015-12-02",
    };
    window.R = window.R || {};
    window.R.CONST = R.CONST || CONST;
}(window));

