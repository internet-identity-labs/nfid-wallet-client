import { When } from "@wdio/cucumber-framework"

import clickElement from "./support/actions/clickElement.js"

When(/^I (click|doubleclick) on the (link|selector) ([^"]*)?$/, clickElement)
