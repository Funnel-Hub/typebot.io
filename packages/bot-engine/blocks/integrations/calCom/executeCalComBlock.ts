import { CalComBlock } from '@typebot.io/schemas'
import { ExecuteIntegrationResponse } from '../../../types'
import { defaultCalComOptions } from '@typebot.io/schemas/features/blocks/integrations/calCom/constants'

export const executeCalComBlock = (
  block: CalComBlock
): ExecuteIntegrationResponse => {
  if (!block?.options?.eventLink) return {
    outgoingEdgeId: block.outgoingEdgeId,
	logs: [{
	  status: 'error',
	  description: 'Missing event link'
	}]
  }

  const baseUrl = block?.options.baseOrigin ?? defaultCalComOptions.baseOrigin
  const eventLink = block?.options.eventLink?.startsWith('http')
    ? block?.options.eventLink.replace(/http.+:\/\/[^\/]+\//, '')
    : block?.options.eventLink

  return {
    outgoingEdgeId: block.outgoingEdgeId,
	customEmbedBubble: {
	  type: 'custom-embed',
	  content: {
		waitForEventFunction: {
		  args: {},
		  content: `Cal("on", {
			action: "bookingSuccessful",
			callback: (e) => {
			  continueFlow(e.detail.data.date)
			}
		  })`,
		},
		initFunction: {
		  args: {
		    baseUrl,
            link: eventLink ?? '',
            name: block.options.user?.name ?? null,
            email: block.options.user?.email ?? null,
            layout: parseLayoutAttr(block.options.layout),
            phone: block.options.user?.phoneNumber ?? null,
		  },
		  content: `(function (C, A, L) {
		  	let p = function (a, ar) {
		  	  a.q.push(ar);
		  	};
		  	let d = C.document;
		  	C.Cal =
		  	  C.Cal ||
		  	  function () {
		  		let cal = C.Cal;
		  		let ar = arguments;
		  		if (!cal.loaded) {
		  		  cal.ns = {};
		  		  cal.q = cal.q || [];
		  		  d.head.appendChild(d.createElement("script")).src = A;
		  		  cal.loaded = true;
		  		}
		  		if (ar[0] === L) {
		  		  const api = function () {
		  			p(api, arguments);
		  		  };
		  		  const namespace = ar[1];
		  		  api.q = api.q || [];
		  		  typeof namespace === "string"
		  			? (cal.ns[namespace] = api) && p(api, ar)
		  			: p(cal, ar);
		  		  return;
		  		}
		  		p(cal, ar);
		  	  };
		    })(window, baseUrl + "/embed/embed.js", "init");
		    Cal("init", { origin: baseUrl });
  
		    const location = phone ? JSON.stringify({
		  	value: "phone",
		  	optionValue: phone
		    }) : undefined
  
		    Cal("inline", {
		  	elementOrSelector: typebotElement,
		  	calLink: link,
		  	layout,
		  	config: {
		  	  name: name ?? undefined,
		  	  email: email ?? undefined,
		  	  location
		  	}
		    });
  
		    Cal("ui", {"hideEventTypeDetails":false,layout});`,
		}
	  }
	}
  }
}

const parseLayoutAttr = (
  layout?: 'Month' | 'Weekly' | 'Columns'
): 'month_view' | 'week_view' | 'column_view' => {
  switch (layout) {
    case 'Weekly':
      return 'week_view'
    case 'Columns':
      return 'column_view'
    default:
      return 'month_view'
  }
}
