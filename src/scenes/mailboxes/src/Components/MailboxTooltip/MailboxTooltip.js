import PropTypes from 'prop-types'
import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import { accountStore, accountActions } from 'stores/account'
import PrimaryTooltip from 'wbui/PrimaryTooltip'
import MailboxTooltipContent from './MailboxTooltipContent'
import ReactDOM from 'react-dom'

const ENTER_DELAY = 750

class MailboxTooltip extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    mailboxId: PropTypes.string.isRequired
  }

  /* **************************************************************************/
  // lifecycle
  /* **************************************************************************/

  constructor (props) {
    super(props)

    this.contentRef = React.createRef()
    this.childWrapRef = React.createRef()
    this.dumpOpen = false
    this.dumpOpenExpirer = null
  }

  /* **************************************************************************/
  // Component lifecycle
  /* **************************************************************************/

  componentDidMount () {
    accountStore.listen(this.accountChanged)
  }

  componentWillUnmount () {
    accountStore.unlisten(this.accountChanged)
  }

  componentWillReceiveProps (nextProps) {
    if (this.props.mailboxId !== nextProps.mailboxId) {
      const accountState = accountStore.getState()
      this.setState({
        isMailboxPrimaryActive: (
          accountState.activeMailboxId() === nextProps.mailboxId &&
          accountState.activeServiceIsFirstInMailbox()
        )
      })
    }
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = (() => {
    const accountState = accountStore.getState()
    return {
      open: false,
      isMailboxPrimaryActive: (
        accountState.activeMailboxId() === this.props.mailboxId &&
        accountState.activeServiceIsFirstInMailbox()
      )
    }
  })()

  accountChanged = (accountState) => {
    this.setState({
      isMailboxPrimaryActive: (
        accountState.activeMailboxId() === this.props.mailboxId &&
        accountState.activeServiceIsFirstInMailbox()
      )
    })
  }

  /* **************************************************************************/
  // Tooltip Actions
  /* **************************************************************************/

  /**
  * Handles the request to open the tooltip
  * @param evt: the event that fired
  */
  handleTooltipOpen = (evt) => {
    if (this.dumpOpen) { return }
    // If you click on an element in the tooltip which causes a redraw but decide
    // to set open=false during the click it can cause the onOpen call to fire again.
    // This causes the tooltip to flash down and up. To guard against this check
    // who's firing the open call and if it's not one of the children ignore it
    evt.persist()
    this.setState((prevState) => {
      if (prevState.open === false) {
        const contentNode = ReactDOM.findDOMNode(this.contentRef.current)
        if (contentNode) {
          if (contentNode.contains(evt.target)) {
            return {}
          }
        }

        const childrenNode = ReactDOM.findDOMNode(this.childWrapRef.current)
        if (!childrenNode || !childrenNode.contains(evt.target)) {
          return {}
        }
      }
      return { open: true }
    })
  }

  /**
  * Handles the request to close the tooltip
  * @param evt: the event that fired
  */
  handleTooltipClose = (evt) => {
    this.setState({ open: false })
    clearTimeout(this.dumpOpenExpirer)
    this.dumpOpen = false
  }

  /**
  * Handles the child wrapper being clicked and decides to show or not
  * @param evt: the event that fired
  */
  handleChildWrapClick = (evt) => {
    if (this.state.isMailboxPrimaryActive) {
      this.setState((prevState) => {
        return { open: !prevState.open }
      })
    } else {
      this.setState({ open: false })
      this.dumpOpen = true
      clearTimeout(this.dumpOpenExpirer)
      this.dumpOpenExpirer = setTimeout(() => {
        this.dumpOpen = false
      }, ENTER_DELAY * 2)
    }
  }

  /* **************************************************************************/
  // UI Actions
  /* **************************************************************************/

  /**
  * Handles opening a service from within the tooltip
  * @param evt: the event that fired
  * @param serviceId: the id of the service to open
  */
  handleOpenService = (evt, serviceId) => {
    this.setState({ open: false }, () => {
      accountActions.changeActiveService(serviceId)
    })
  }

  /**
  * Handles opening settings from within the tooltip
  * @param evt: the event that fired
  * @param mailboxId: the id of the mailbox to open
  */
  handleOpenSettings = (evt, mailboxId) => {
    this.setState({ open: false }, () => {
      window.location.hash = `/settings/accounts/${mailboxId}`
    })
  }

  /**
  * Handles adding a service from within the tooltip
  * @param evt: the event that fired
  * @param mailboxId: the id of the mailbox to add to
  */
  handleAddService = (evt, mailboxId) => {
    this.setState({ open: false }, () => {
      window.location.hash = `/mailbox_wizard/add/${mailboxId}`
    })
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const {
      mailboxId,
      children,
      ...passProps
    } = this.props
    const {
      open
    } = this.state

    return (
      <PrimaryTooltip
        interactive
        disablePadding
        width={400}
        enterDelay={ENTER_DELAY}
        leaveDelay={1}
        onClose={this.handleTooltipClose}
        onOpen={this.handleTooltipOpen}
        open={open}
        title={(
          <MailboxTooltipContent
            innerRef={this.contentRef}
            mailboxId={mailboxId}
            onOpenService={this.handleOpenService}
            onOpenSettings={this.handleOpenSettings}
            onAddService={this.handleAddService} />
        )}
        {...passProps}>
        <div
          ref={this.childWrapRef}
          onClick={this.handleChildWrapClick}>
          {children}
        </div>
      </PrimaryTooltip>
    )
  }
}

export default MailboxTooltip
