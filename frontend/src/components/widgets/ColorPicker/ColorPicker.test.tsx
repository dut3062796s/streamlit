/**
 * @license
 * Copyright 2018-2021 Streamlit Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React from "react"
import { shallow } from "lib/test_util"
import { StatefulPopover as UIPopover } from "baseui/popover"
import { ColorPicker as ColorPickerProto } from "autogen/proto"
import { WidgetStateManager } from "lib/WidgetStateManager"
import { ChromePicker } from "react-color"

import ColorPicker, { Props } from "./ColorPicker"

jest.mock("lib/WidgetStateManager")

const sendBackMsg = jest.fn()

const getProps = (elementProps: Partial<ColorPickerProto> = {}): Props => ({
  element: ColorPickerProto.create({
    id: "1",
    label: "Label",
    default: "#000000",
    ...elementProps,
  }),
  width: 0,
  disabled: false,
  widgetMgr: new WidgetStateManager(sendBackMsg),
})
const props = getProps()
const wrapper = shallow(<ColorPicker {...props} />)
const colorPickerWrapper = wrapper.find(UIPopover).renderProp("content")()

describe("ColorPicker widget", () => {
  it("renders without crashing", () => {
    expect(wrapper.find(UIPopover).length).toBe(1)
    expect(colorPickerWrapper.find(ChromePicker).length).toBe(1)
  })

  it("should render a label in the title", () => {
    const wrappedDiv = wrapper.find("StyledColorPicker")
    expect(wrappedDiv.find("StyledWidgetLabel").text()).toBe(
      props.element.label
    )
  })

  it("should set widget value on did mount", () => {
    expect(props.widgetMgr.setStringValue).toHaveBeenCalledWith(
      props.element.id,
      props.element.default,
      { fromUi: false }
    )
  })

  it("should have correct style", () => {
    const wrappedDiv = wrapper.find("StyledColorPicker")
    const { style } = wrappedDiv.props()

    // @ts-ignore
    expect(style.width).toBe(getProps().width)
  })

  it("should render a default color in the preview and the color picker", () => {
    wrapper.find(UIPopover).simulate("click")
    const chromePickerWrapper = wrapper.find(UIPopover).renderProp("content")()

    expect(wrapper.find("StyledColorPreview").prop("style")).toEqual({
      backgroundColor: "#000000",
      boxShadow: "#000000 0px 0px 4px",
    })

    expect(chromePickerWrapper.prop("color")).toEqual("#000000")
  })

  it("supports hex shorthand", () => {
    wrapper.find(UIPopover).simulate("click")

    // this doesnt work either
    colorPickerWrapper.prop("onChangeComplete")({
      hex: "#333",
    })

    expect(
      wrapper
        .find(UIPopover)
        .renderProp("content")()
        .prop("color")
    ).toEqual("#333")
  })

  it("should update the widget value when it's changed", () => {
    const newColor = "#E91E63"
    wrapper.find(UIPopover).simulate("click")

    colorPickerWrapper.prop("onChangeComplete")({
      hex: newColor,
    })

    expect(
      wrapper
        .find(UIPopover)
        .renderProp("content")()
        .prop("color")
    ).toEqual(newColor)
  })

  it("should disable alpha property for now", () => {
    wrapper.find(UIPopover).simulate("click")
    expect(colorPickerWrapper.prop("disableAlpha")).toStrictEqual(true)
  })
})
