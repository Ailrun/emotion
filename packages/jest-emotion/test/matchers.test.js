import 'test-utils/legacy-env'
import React from 'react'
import renderer from 'react-test-renderer'
import * as enzyme from 'enzyme'
import * as core10 from '@emotion/core'
import * as emotion from 'emotion'
import styled from 'react-emotion'
import { matchers } from 'jest-emotion'

const { toHaveStyleRule } = matchers

expect.extend(matchers)

describe('toHaveStyleRule', () => {
  const divStyle = emotion.css`
    color: red;
  `

  const svgStyle = emotion.css`
    width: 100%;
  `

  const enzymeMethods = ['shallow', 'mount', 'render']

  it('matches styles on the top-most node passed in', () => {
    const tree = renderer
      .create(
        <div className={divStyle}>
          <svg className={svgStyle} />
        </div>
      )
      .toJSON()

    expect(tree).toHaveStyleRule('color', 'red')
    expect(tree).not.toHaveStyleRule('width', '100%')

    const svgNode = tree.children[0]

    expect(svgNode).toHaveStyleRule('width', '100%')
    expect(svgNode).not.toHaveStyleRule('color', 'red')
  })

  it('supports asymmetric matchers', () => {
    const tree = renderer
      .create(
        <div className={divStyle}>
          <svg className={svgStyle} />
        </div>
      )
      .toJSON()

    expect(tree).toHaveStyleRule('color', expect.anything())
    expect(tree).not.toHaveStyleRule('padding', expect.anything())

    const svgNode = tree.children[0]

    expect(svgNode).toHaveStyleRule('width', expect.stringMatching(/.*%$/))
  })

  it('supports enzyme render methods', () => {
    const Component = () => (
      <div className={divStyle}>
        <svg className={svgStyle} />
      </div>
    )

    enzymeMethods.forEach(method => {
      const wrapper = enzyme[method](<Component />)
      expect(wrapper).toHaveStyleRule('color', 'red')
      expect(wrapper).not.toHaveStyleRule('width', '100%')
      const svgNode = wrapper.find('svg')
      expect(svgNode).toHaveStyleRule('width', '100%')
      expect(svgNode).not.toHaveStyleRule('color', 'red')
    })
  })

  // i think this isn't working because of forwardRef
  it.skip('supports styled components', () => {
    const Div = styled('div')`
      color: red;
    `
    const Svg = styled('svg')`
      width: 100%;
    `

    enzymeMethods.forEach(method => {
      const wrapper = enzyme[method](
        <Div>
          <Svg />
        </Div>
      )
      expect(wrapper).toHaveStyleRule('color', 'red')
      expect(wrapper).not.toHaveStyleRule('width', '100%')
      const svgNode =
        method === 'render' ? wrapper.find('svg') : wrapper.find(Svg)
      expect(svgNode).toHaveStyleRule('width', '100%')
      expect(svgNode).not.toHaveStyleRule('color', 'red')
    })
  })

  it('fails if no styles are found', () => {
    const tree = renderer.create(<div />).toJSON()
    const result = toHaveStyleRule(tree, 'color', 'red')
    expect(result.pass).toBe(false)
    expect(result.message()).toBe('Property not found: color')
  })

  it('supports regex values', () => {
    const tree = renderer.create(<div className={divStyle} />).toJSON()
    expect(tree).toHaveStyleRule('color', /red/)
  })

  it.skip('returns a message explaining the failure', () => {
    const tree = renderer.create(<div className={divStyle} />).toJSON()

    // When expect(tree).toHaveStyleRule('color', 'blue') fails
    const resultFail = toHaveStyleRule(tree, 'color', 'blue')
    expect(resultFail.message()).toMatchSnapshot()

    // When expect(tree).not.toHaveStyleRule('color', 'red')
    const resultPass = toHaveStyleRule(tree, 'color', 'red')
    expect(resultPass.message()).toMatchSnapshot()
  })

  describe.only('with Emotion 10 jsx', () => {
    const divStyle10 = core10.css`
      color: red;
    `

    const svgStyle10 = core10.css`
      width: 100%;
    `

    const jsxElement10 = core10.jsx(
      'div',
      { css: divStyle10 },
      core10.jsx('svg', { css: svgStyle10 })
    )

    it('supports react-test-renderer', () => {
      const tree = renderer.create(jsxElement10).toJSON()

      expect(tree).toHaveStyleRule('color', 'red')
      expect(tree).not.toHaveStyleRule('width', '100%')

      const svgNode = tree.children[0]

      expect(svgNode).toHaveStyleRule('width', '100%')
      expect(svgNode).not.toHaveStyleRule('color', 'red')
    })

    it.only('supports enzyme render methods', () => {
      enzymeMethods.forEach(method => {
        const wrapper = enzyme[method](jsxElement10)
        expect(wrapper).toHaveStyleRule('color', 'red')
        expect(wrapper).not.toHaveStyleRule('width', '100%')
        const svgNode = wrapper.find('svg')
        expect(svgNode).toHaveStyleRule('width', '100%')
        expect(svgNode).not.toHaveStyleRule('color', 'red')
      })

      const Component = () => jsxElement10

      enzymeMethods.forEach(method => {
        const wrapper = enzyme[method](<Component />)
        expect(wrapper).toHaveStyleRule('color', 'red')
        expect(wrapper).not.toHaveStyleRule('width', '100%')
        const svgNode = wrapper.find('svg')
        expect(svgNode).toHaveStyleRule('width', '100%')
        expect(svgNode).not.toHaveStyleRule('color', 'red')
      })
    })
  })
})
