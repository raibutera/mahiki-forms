import React, { Component } from 'react';
import { Field, reduxForm } from 'redux-form';
import { split } from 'rambda';
import { format } from 'date-fns';
import PulseLoader from 'react-spinners/PulseLoader';
import { MdCheck } from 'react-icons/md';
import submit from './submit/table';
import {
  validateTime,
  validateName,
  validateEmail,
  validatePhoneNumber,
  validateDate
} from './validation';
import { SuccessModal, FailureModal } from './popup';
const DATE_FORMAT = 'YYYY-MM-DD';

export const warnForm = values => {
  const warnings = {};
  const today = format(new Date(), DATE_FORMAT);
  if (values.date && values.date === today) {
    warnings.date =
      'For same day reservations and parties over 10 please call us on 020 7493 9529';
  }
  return warnings;
};
// https://redux-form.com/6.6.3/examples/syncvalidation/
export const validateForm = values => {
  const errors = {};
  const { name, email, phone, date, tabletype, numpeople } = values;

  if (!name) {
    errors.name = 'Please enter your name';
  } else if (!validateName(name)) {
    errors.name = 'Please enter alphabetical characters only';
  }

  if (!email) {
    errors.email = 'Please enter your email address';
  }

  if (!validateEmail(email)) {
    errors.email = 'Please enter a valid email address.';
  }

  if (!phone || !validatePhoneNumber(phone)) {
    errors.phone =
      'Please provide a UK Phone Number or Mobile Telephone Number.';
  }
  if (!date || !validateDate(date)) {
    errors.date = 'Please choose a valid date for your visit';
  }

  if (
    !tabletype ||
    !(
      tabletype === 'Late' ||
      tabletype === 'Dinner' ||
      tabletype === 'Cocktails'
    )
  ) {
    errors.tabletype =
      'Please select the type of table reservation you would like to make.';
  }

  if (!numpeople) {
    errors.numpeople =
      'Please enter the number of people that will be attending your table.';
  }

  return errors;
};

const renderField = ({
  input,
  label,
  type,
  meta: { touched, error, warning }
}) => (
  <div
    className={
      'form-group ' +
      (touched && error ? 'has-error' : '') +
      (touched && warning ? 'has-warning' : '')
    }
  >
    <label className="control-label">{label}</label>
    <input
      className="form-control"
      {...input}
      placeholder={label}
      type={type}
    />
    {touched &&
      ((error && <p className="help-block">{error}</p>) ||
        (warning && <p className="help-block">{warning}</p>))}
  </div>
);

let tableForm = props => {
  const {
    handleSubmit,
    pristine,
    done,
    reset,
    invalid,
    valid,
    submitting
  } = props;
  const renderSubmitText = () => {
    if (submitting) {
      return (
        <PulseLoader
          sizeUnit="em"
          size={1}
          color="#FFFFFF"
          loading={submitting}
        />
      );
    }
    if (done) {
      return (
        <div>
          Request Sent <MdCheck />
        </div>
      );
    }
    if (pristine || valid) {
      return 'Send Request';
    }
    return 'Cannot Send Request - Check Errors';
  };
  return (
    <div className="booking-form">
      <form onSubmit={handleSubmit}>
        <Field
          name="name"
          component={renderField}
          type="text"
          className="form-control"
          id="book-table-name"
          label="Name"
        />

        <Field
          name="email"
          component={renderField}
          type="email"
          className="form-control"
          id="book-table-email"
          label="Email"
        />

        <Field
          name="phone"
          component={renderField}
          type="tel"
          className="form-control"
          id="book-table-phone"
          label="Phone No."
        />

        <Field
          name="date"
          component={renderField}
          type="date"
          className="form-control"
          id="book-table-date"
          label="Date of Visit (dd/mm/yyyy)"
        />

        <div className="form-group">
          <label for="book-table-tabletype">Type of Event</label>
          <Field
            name="tabletype"
            component="select"
            className="form-control"
            id="book-table-tabletype"
            placeholder="Dinner / Late Night / Cocktails"
          >
            <option value="Dinner">Dinner</option>
            <option value="Late">Late Night</option>
            <option value="Cocktails">Cocktails</option>
          </Field>
        </div>

        <Field
          name="numpeople"
          component={renderField}
          type="number"
          className="form-control"
          id="book-table-numpeople"
          label="No. of People"
        />
        <div className="form-group">
          <label for="book-table-additional">Additional Requests</label>
          <Field
            name="additional"
            component="textarea"
            className="form-control"
            rows="4"
            id="book-table-additional"
            placeholder="Additional requests and comments to add to your booking enquiry (optional)"
          />
        </div>

        <button
          className={`btn btn-lg btn-block
          ${pristine ? ' btn-default' : ''} 
          ${done ? ' btn-success' : ''}
          ${valid && !pristine ? ' btn-primary' : ''}
          ${invalid && !pristine ? ' btn-danger' : ''}
          ${submitting ? ' btn-warning' : ''}`}
          type="submit"
          disabled={submitting || done}
        >
          {renderSubmitText()}
        </button>
      </form>
    </div>
  );
};

export const TableForm = reduxForm({
  form: 'book-table',
  warn: warnForm,
  validate: validateForm
})(tableForm);

export class TableFormContainer extends Component {
  constructor(props) {
    super(props);
    const { success = false, failure = false } = props;
    this.state = {
      sent: success,
      failed: failure,
      done: false
    };
  }

  showSuccess = () => {
    this.setState({ sent: true, done: true, failed: false });
  };

  hideSuccess = () => {
    this.setState({ done: true, sent: false, failed: false });
  };

  showFailure = errors => {
    this.setState({ done: false, sent: false, failed: true, errors });
  };

  hideFailure = () => {
    this.setState({ done: false, sent: false, failed: false });
  };

  render() {
    const { sent, failed, done, errors } = this.state;
    const { hideSuccess, hideFailure } = this;
    return (
      <div>
        {sent && <SuccessModal show={sent} onHide={hideSuccess} />}
        {failed && (
          <FailureModal show={failed} onHide={hideFailure} errors={errors} />
        )}

        <div className="container">
          <TableForm
            onSubmit={submit}
            onSubmitSuccess={this.showSuccess}
            onSubmitFail={this.showFailure}
            done={done}
          />
        </div>
      </div>
    );
  }
}

export default TableFormContainer;
