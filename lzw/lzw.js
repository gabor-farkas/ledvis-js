/*
; --------------------------------------------------
; in:	lzw_source,lzw_slen
;	lzw_destination - allocated buffer
;	lzw_cww	- initial code word width
; out:	lzw_destlen - final byte count
; cww bit width is limited to 24, which gives a limit of 16777216 bytes
; on input files
; dictionary item length is limited to 255
; --------------------------------------------------
global	_lzw_uncompress
extern	_debugeax
*/
/*
lzw_source		dd	0
lzw_slen		dd	0
lzw_destination		dd	0
lzw_destlen		dd	0
lzw_cww			dd	9	;word width
lzw_maxdictsize		dd	0
;-
lzw_sbp			dd	0	;source bit position
lzw_dict		dd	0	;structured list:
					; one byte length, dword pointer
lzw_dnext		dd	0
lzw_lastcwlen		dd	0
lzw_dicthidden		dd	0	;the first dict item index
					; that is present
lzw_dindex		dd	0
lzw_cwwmask		dd	0
lzw_cwwmask2		dd	0
*/

function lzw() {
    let lzw_sbp = 0;
    let lzw_cww = 9;
    let lzw_cwwmask = 0;
    let lzw_cwwmask2 = 0;
    function lzwGetnextcw(lzw_source) {

        let esi = lzw_sbp;
        let eax = lzw_cww;
        lzw_sbp += eax;
        let ecx = esi;
        esi >>= 3;
        ecx &= 7;
        eax = lzw_source[esi]
            + (lzw_source[esi + 1] << 8)
            + (lzw_source[esi + 2] << 16)
            + (lzw_source[esi + 3] << 24);
        eax >>= ecx;
        eax &= lzw_cwwmask;

        return eax;
    }

    function lzwUncompress(lzw_source, lzw_destination) {
        let lzw_slen = lzw_source.length;

        lzw_sbp = 0;
        lzw_cww = 9;
        let lzw_dict = [];
        let lzw_dnext = 0; //index in lzw_dict

        let eax = 1;
        let ebx = eax;
        let ecx = lzw_cww;
        ebx <<= ecx;
        ebx--;
        lzw_cwwmask = ebx;
        ebx = -ebx;
        lzw_cwwmask2 = ebx;
        ecx--;
        eax <<= ecx;
        let lzw_dicthidden = eax
        let lzw_dindex = eax; //index in dicthidden

        let edi = 0; // index in lzw_destination
        ucl0: while(true) {
            eax = lzwGetnextcw(lzw_source);
            if (eax < lzw_dicthidden) {
                //;- cw not present in dictionary - copied directly
                lzw_destination[edi++] = eax;
                lzw_lastcwlen = 1;
            } else {// uc0;
                eax -= lzw_dicthidden;
                ecx = lzw_dict[eax].cwlength;
                lzw_lastcwlen = ecx;
                for (let i = 0; i < ecx; i++) {
                    lzw_destination[edi++] = lzw_destination[lzw_dict[eax].indexInDestination + i];
                }
            } //.uc_ad:		;-- add to dictionary
            eax = lzw_dindex >> lzw_cww;
            if (eax != 0) {
                //;-- inc cww
                lzw_cww++;
                eax = lzw_cwwmask;
                eax <<= 1;
                eax++;
                lzw_cwwmask = eax;
                lzw_cwwmask2 <<= 1;
            }   //.uc1:	
            let esi = lzw_dnext;
            lzw_dnext++;
            lzw_dict[esi] = {};
            lzw_dict[esi].cwlength = lzw_lastcwlen + 1;
            lzw_dict[esi].indexInDestination = edi  - lzw_lastcwlen;
            lzw_dindex ++;
            eax = lzw_slen;
            eax <<= 3;
            eax -= lzw_sbp;
            if (eax < lzw_cww) {
                break ucl0;
            }
        }

    }
    return {
        uncompress: lzwUncompress
    }
}