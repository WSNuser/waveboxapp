import React from 'react'
import PropTypes from 'prop-types'
import shallowCompare from 'react-addons-shallow-compare'
import MailboxReauthenticatingSceneContent from './MailboxReauthenticatingSceneContent'
import { withStyles } from '@material-ui/core/styles'
import { RouterDialog } from 'Components/RouterDialog'

const styles = {
  root: {
    maxWidth: '100%',
    width: '100%',
    height: '100%'
  }
}

@withStyles(styles)
class MailboxReauthenticatingScene extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    routeName: PropTypes.string.isRequired
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const { classes, routeName } = this.props

    return (
      <RouterDialog
        routeName={routeName}
        disableEnforceFocus
        disableBackdropClick
        disableEscapeKeyDown
        classes={{ paper: classes.root }}>
        <MailboxReauthenticatingSceneContent />
      </RouterDialog>
    )
  }
}

export default MailboxReauthenticatingScene
