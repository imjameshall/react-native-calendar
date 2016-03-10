'use strict';

let React = require('react-native');
let moment = require('moment');

let {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  PropTypes,
  View
} = React;

let
  MAX_COLUMNS = 7,
  MAX_ROWS = 7,
  DEVICE_WIDTH = Dimensions.get('window').width,
  VIEW_INDEX = 2;

let Day = React.createClass({

  propTypes: {
    currentView: PropTypes.string,
    newDay: PropTypes.object,
    isSelected: PropTypes.bool,
    isToday: PropTypes.bool,
    hasEvent: PropTypes.bool,
    currentDay: PropTypes.number,
    onPress: PropTypes.func,
    usingEvents: PropTypes.bool,
    filler: PropTypes.bool,
    customStyle: PropTypes.object,
  },

  getDefaultProps () {
    return {
      customStyle: {},
    }
  },

  shouldComponentUpdate(nextProps, nextState) {
    return this.props.isSelected !== nextProps.isSelected || this.props.hasEvent !== nextProps.hasEvent
  },

  _dayCircleStyle(newDay, isSelected, isToday) {
    var dayCircleStyle = [styles.dayCircleFiller, this.props.customStyle.dayCircleFiller];
    if (isSelected && !isToday) {
      dayCircleStyle.push(styles.selectedDayCircle);
      dayCircleStyle.push(this.props.customStyle.selectedDayCircle);
    } else if (isSelected && isToday) {
      dayCircleStyle.push(styles.currentDayCircle);
      dayCircleStyle.push(this.props.customStyle.currentDayCircle);
    }
    return dayCircleStyle;
  },

  _dayTextStyle(newDay, isSelected, isToday) {
    var dayTextStyle = [styles.day, this.props.customStyle.day];
    if (isToday && !isSelected) {
      dayTextStyle.push(styles.currentDayText);
      dayTextStyle.push(this.props.customStyle.currentDayText);
    } else if (isToday || isSelected) {
      dayTextStyle.push(styles.selectedDayText);
      dayTextStyle.push(this.props.customStyle.selectedDayText);
    } else if (moment(newDay).day() === 6 || moment(newDay).day() === 0) {
      dayTextStyle.push(styles.weekendDayText);
      dayTextStyle.push(this.props.customStyle.weekendDayText);
    }
    return dayTextStyle;
  },

  render() {
    let {
      currentDay,
      newDay,
      isSelected,
      isToday,
      hasEvent,
      usingEvents,
      filler,
    } = this.props;

    if (filler) {
      return (
        <TouchableWithoutFeedback>
          <View style={[styles.dayButtonFiller, this.props.customStyle.dayButtonFiller]}>
            <Text style={[styles.day, this.props.customStyle.day]}></Text>
          </View>
        </TouchableWithoutFeedback>
      );
    } else {
      return (
        <TouchableOpacity onPress={() => this.props.onPress(newDay)}>
          <View style={[styles.dayButton, this.props.customStyle.dayButton]}>
            <View style={this._dayCircleStyle(newDay, isSelected, isToday)}>
              <Text style={this._dayTextStyle(newDay, isSelected, isToday)}>
                {this.props.currentView == 'CurrentViewWeekView' ? currentDay : currentDay + 1}
              </Text>
            </View>
            {usingEvents ?
              <View style={[styles.eventIndicatorFiller, this.props.customStyle.eventIndicatorFiller, hasEvent && styles.eventIndicator, hasEvent && this.props.customStyle.eventIndicator]}></View>
              : null
            }
          </View>
        </TouchableOpacity>
      );
    }
  }
});

let Calendar = React.createClass({
  propTypes: {
    currentView: PropTypes.string,
    dayHeadings: PropTypes.array,
    onDateSelect: PropTypes.func,
    scrollEnabled: PropTypes.bool,
    showControls: PropTypes.bool,
    prevButtonText: PropTypes.string,
    nextButtonText: PropTypes.string,
    titleFormat: PropTypes.string,
    onSwipeNext: PropTypes.func,
    onSwipePrev: PropTypes.func,
    onTouchNext: PropTypes.func,
    onTouchPrev: PropTypes.func,
    eventDates: PropTypes.array,
    startDate: PropTypes.string,
    selectedDate: PropTypes.string,
    customStyle: PropTypes.object,
  },

  getDefaultProps() {
    return {
      scrollEnabled: false,
      showControls: false,
      prevButtonText: 'Prev',
      nextButtonText: 'Next',
      titleFormat: 'MMMM YYYY',
      dayHeadings: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
      startDate: moment().format('YYYY-MM-DD'),
      eventDates: [],
      customStyle: {},
    }
  },

  getInitialState() {
    return {
      calendarDates: this.getInitialStack(this.props.currentView),
      selectedDate: moment(this.props.selectedDate).format(),
      currentMonth: moment(this.props.startDate).format(),
      currentWeek: moment(this.props.startDate).format(),
      currentView: this.props.currentView
    };
  },

  componentWillMount() {
    this.renderedMonths = [];
    this.renderedWeeks = [];
  },

  componentDidMount() {
    this._scrollToItem(VIEW_INDEX);
  },

  getInitialStack(currentView) {
    var initialStack = [];
    if (this.props.scrollEnabled) {
      if (currentView == 'CurrentViewMonthView') {
        initialStack.push(moment(this.props.startDate).subtract(2, 'month').format());
        initialStack.push(moment(this.props.startDate).subtract(1, 'month').format());
        initialStack.push(moment(this.props.startDate).format());
        initialStack.push(moment(this.props.startDate).add(1, 'month').format());
        initialStack.push(moment(this.props.startDate).add(2, 'month').format());
      }
      else {
        initialStack.push(moment(this.props.startDate).subtract(2, 'week').format());
        initialStack.push(moment(this.props.startDate).subtract(1, 'week').format());
        initialStack.push(moment(this.props.startDate).format());
        initialStack.push(moment(this.props.startDate).add(1, 'week').format());
        initialStack.push(moment(this.props.startDate).add(2, 'week').format());
      }
    } else {
      initialStack.push(moment(this.props.startDate).format())
    }
    return initialStack;
  },


  renderTopBar(date) {
    if(this.props.showControls) {
      return (
        <View style={[styles.calendarControls, this.props.customStyle.calendarControls]}>
          <TouchableOpacity style={[styles.controlButton, this.props.customStyle.controlButton]} onPress={this._onPrev}>
            <Text style={[styles.controlButtonText, this.props.customStyle.controlButtonText]}>{this.props.prevButtonText}</Text>
          </TouchableOpacity>
          <Text style={[styles.title, this.props.customStyle.title]}>
            {this.props.currentView == 'CurrentViewMonthView' ?
                moment(this.state.currentMonth).format(this.props.titleFormat) :
                    moment(this.state.currentWeek).format()}
          </Text>
          <TouchableOpacity style={[styles.controlButton, this.props.customStyle.controlButton]} onPress={this._onNext}>
            <Text style={[styles.controlButtonText, this.props.customStyle.controlButtonText]}>{this.props.nextButtonText}</Text>
          </TouchableOpacity>
        </View>
      )
    } else {
      return (
        <View style={[styles.calendarControls, this.props.customStyle.calendarControls]}>
          <Text style={[styles.title, this.props.customStyle.title]}>
              {this.props.currentView == 'CurrentViewMonthView' ?
                moment(this.state.currentMonth).format(this.props.titleFormat) :
                    moment(this.state.currentWeek).startOf('week').format('MMM DD') + ' - ' + moment(this.state.currentWeek).endOf('week').format('MMM DD')}
          </Text>
        </View>
      )
    }
  },

  renderHeading() {
    return (
      <View style={[styles.calendarHeading, this.props.customStyle.calendarHeading]}>
        {this.props.dayHeadings.map((day, i) =>
          <Text key={i} style={i == 0 || i == 6 ? [styles.weekendHeading, this.props.customStyle.weekendHeading] : [styles.dayHeading, this.props.customStyle.dayHeading]}>{day}</Text>
        )}
      </View>
    )
  },

  renderWeekView(date) {
    var dayStart = moment(date).startOf('week').format();

    var renderedWeekView;
    var currentDay = moment(dayStart).format();
    var newDay;
    let days = [];
    var weekRows = [];

    for (let i = 0; i < MAX_COLUMNS; i++) {
      newDay = moment(dayStart).set('date', moment(currentDay).date());

      let isToday = (moment().isSame(newDay, 'week') && moment().isSame(newDay, 'day')) ? true : false;
      let isSelected = (moment(this.state.selectedDate).isSame(newDay, 'week') && moment(this.state.selectedDate).isSame(newDay, 'day')) ? true : false;
      let hasEvent = false;

      days.push((
        <Day
          currentView={'CurrentViewWeekView'}
          key={currentDay}
          onPress={this._selectDate}
          currentDay={moment(currentDay).date()}
          newDay={newDay}
          isToday={isToday}
          isSelected={isSelected}
          hasEvent={hasEvent}
          usingEvents={this.props.eventDates.length > 0 ? true : false}
          customStyle={this.props.customStyle}
        />
      ));

      currentDay = moment(currentDay).add(1, 'day').format()
    }

    weekRows.push(
      <View key={0} style={[styles.weekRow, this.props.customStyle.weekRow]}>{days}</View>
    );

    renderedWeekView = <View key={moment(date).week()} style={styles.monthContainer}>{weekRows}</View>;

    this.renderedWeeks.push([date, renderedWeekView]);
    return renderedWeekView;
  },

  renderMonthView(date) {
    var dayStart = moment(date).startOf('month').format();
    var daysInMonth = moment(dayStart).daysInMonth();
    var offset = moment(dayStart).get('day');
    var preFiller = 0;
    var currentDay = 0;
    var weekRows = [];
    var renderedMonthView;

    for (let i = 0; i < MAX_COLUMNS; i++) {
      let days = [];

      for (let j = 0; j < MAX_ROWS; j++) {
        if (preFiller < offset) {
          days.push(
            <Day key={`${i},${j}`} filler={true} />
          );
        }
        else {
          if (currentDay < daysInMonth) {
            var newDay = moment(dayStart).set('date', currentDay + 1);
            let isToday = (moment().isSame(newDay, 'month') && moment().isSame(newDay, 'day')) ? true : false;
            let isSelected = (moment(this.state.selectedDate).isSame(newDay, 'month') && moment(this.state.selectedDate).isSame(newDay, 'day')) ? true : false;
            let hasEvent = false;
            if (this.props.eventDates) {
              for (let x = 0; x < this.props.eventDates.length; x++) {
                hasEvent = moment(this.props.eventDates[x]).isSame(newDay, 'day') ? true : false;
                if (hasEvent) { break; }
              }
            }

            days.push((
              <Day
                key={`${i},${j}`}
                onPress={this._selectDate}
                currentDay={currentDay}
                newDay={newDay}
                isToday={isToday}
                isSelected={isSelected}
                hasEvent={hasEvent}
                usingEvents={this.props.eventDates.length > 0 ? true : false}
                customStyle={this.props.customStyle}
              />
            ));
            currentDay++;
          }
        }
        preFiller++;
      } // row

      if (days.length > 0 && days.length < 7) {
        for (let x = days.length; x < 7; x++) {
          days.push(<Day key={x} filler={true}/>);
        }

        weekRows.push(
          <View key={weekRows.length} style={[styles.weekRow, this.props.customStyle.weekRow]}>{days}</View>
        );
      }
      else {
        if (days.length === 0) {
          weekRows.push(<View key={weekRows.length} style={[styles.weekRowBlank]}>{days}</View>);
        }
        else {
          weekRows.push(<View key={weekRows.length} style={[styles.weekRowMain, this.props.customStyle.weekRow]}>{days}</View>);
        }
      }
    } // column

    renderedMonthView = <View key={moment(newDay).month()} style={styles.monthContainer}>{weekRows}</View>;
    // keep this rendered month view in case it can be reused without generating it again
    this.renderedMonths.push([date, renderedMonthView])
    return renderedMonthView;
  },

  _dayCircleStyle(newDay, isSelected, isToday) {
    var dayCircleStyle = [styles.dayCircleFiller, this.props.customStyle.dayCircleFiller];
    if (isSelected && !isToday) {
      dayCircleStyle.push(styles.selectedDayCircle);
      dayCircleStyle.push(this.props.customStyle.selectedDayCircle);
    } else if (isSelected && isToday) {
      dayCircleStyle.push(styles.currentDayCircle);
      dayCircleStyle.push(this.props.customStyle.currentDayCircle);
    }
    return dayCircleStyle;
  },

  _dayTextStyle(newDay, isSelected, isToday) {
    var dayTextStyle = [styles.day, this.props.customStyle.day];
    if (isToday && !isSelected) {
      dayTextStyle.push(styles.currentDayText);
      dayTextStyle.push(this.props.customStyle.currentDayText);
    } else if (isToday || isSelected) {
      dayTextStyle.push(styles.selectedDayText);
      dayTextStyle.push(this.props.customStyle.selectedDayText);
    } else if (moment(newDay).day() === 6 || moment(newDay).day() === 0) {
      dayTextStyle.push(styles.weekendDayText);
      dayTextStyle.push(this.props.customStyle.weekendDayText);
    }
    return dayTextStyle;
  },

  _prependMonth() {
    var calendarDates = this.state.calendarDates;
    calendarDates.unshift(moment(calendarDates[0]).subtract(1, 'month').format());
    calendarDates.pop();
    this.setState({
      calendarDates: calendarDates,
      currentMonth: calendarDates[this.props.scrollEnabled ? VIEW_INDEX : 0]
    });
  },

  _prependWeek() {
    var calendarDates = this.state.calendarDates;
    calendarDates.unshift(moment(calendarDates[0]).subtract(1, 'week').format());
    calendarDates.pop();
    this.setState({
      calendarDates: calendarDates,
      currentWeek: calendarDates[this.props.scrollEnabled ? VIEW_INDEX : 0]
    });
  },

  _appendMonth() {
    var calendarDates = this.state.calendarDates;
    calendarDates.push(moment(calendarDates[calendarDates.length - 1]).add(1, 'month').format());
    calendarDates.shift();
    this.setState({
      calendarDates: calendarDates,
      currentMonth: calendarDates[this.props.scrollEnabled ? VIEW_INDEX : 0]
    });
  },

  _appendWeek() {
    var calendarDates = this.state.calendarDates;
    calendarDates.push(moment(calendarDates[calendarDates.length - 1]).add(1, 'week').format());
    calendarDates.shift();
    this.setState({
      calendarDates: calendarDates,
      currentWeek: calendarDates[this.props.scrollEnabled ? VIEW_INDEX : 0]
    });
  },

  _selectDate(date) {
    this.setState({
      selectedDate: date,
    });
    this.props.onDateSelect && this.props.onDateSelect(date.format());
  },

  _onPrev(){
    this._prependMonth();
    this._scrollToItem(VIEW_INDEX);
    this.props.onTouchPrev && this.props.onTouchPrev(this.state.calendarDates[VIEW_INDEX]);
  },

  _onNext(){
    this._appendMonth();
    this._scrollToItem(VIEW_INDEX);
    this.props.onTouchNext && this.props.onTouchNext(this.state.calendarDates[VIEW_INDEX]);
  },

  _scrollToItem(itemIndex) {
    var scrollToX = itemIndex * DEVICE_WIDTH;

    if (this.props.scrollEnabled) {
      this.refs.calendar.scrollWithoutAnimationTo(0, scrollToX);
    }
  },

  _scrollEnded(event) {

    var position = event.nativeEvent.contentOffset.x;
    var currentPage = position / DEVICE_WIDTH;

    if (currentPage < VIEW_INDEX) {
      if (this.props.currentView == 'CurrentViewMonthView') {
        this._prependMonth();
        this._scrollToItem(VIEW_INDEX);
        this.props.onSwipePrev && this.props.onSwipePrev();
      }
      else {
        this._prependWeek();
        this._scrollToItem(VIEW_INDEX);
      }
    }
    else if (currentPage > VIEW_INDEX) {
      if (this.props.currentView == 'CurrentViewMonthView') {
        this._appendMonth();
        this._scrollToItem(VIEW_INDEX);
        this.props.onSwipeNext && this.props.onSwipeNext();
      }
      else {
        this._appendWeek();
        this._scrollToItem(VIEW_INDEX);
      }
    }
    else {
      return false;
    }
  },

  _renderedWeek(date) {
    var renderedWeek = null;
    if (moment(this.state.currentWeek).isSame(date, 'week')) {
      renderedWeek = this.renderWeekView(date);
    }
    else {
      for (var i = 0; i < this.renderedWeeks.length; i++) {
        let compareDate = this.renderedWeeks[i][0];
        if (moment(compareDate).isSame(date, 'week')) {
          renderedWeek = this.renderedWeeks[i][1];
        }
      }

      if (!renderedWeek) {
        renderedWeek = this.renderWeekView(date);
      }
    }
    return renderedWeek;
  },

  _renderedMonth(date) {
    var renderedMonth = null;
    if (moment(this.state.currentMonth).isSame(date, 'month')) {
      renderedMonth = this.renderMonthView(date);
    }
    else {
      for (var i = 0; i < this.renderedMonths.length; i++) {
        if (moment(this.renderedMonths[i][0]).isSame(date, 'month')) {
          renderedMonth = this.renderedMonths[i][1];
        }
      }

      if (!renderedMonth) {
        renderedMonth = this.renderMonthView(date);
      }
    }
    return renderedMonth;
  },

  render() {
    return (
      <View style={[styles.calendarContainer, this.props.customStyle.calendarContainer]}>
        {this.renderTopBar()}
        {this.renderHeading(this.props.titleFormat)}
        {this.props.scrollEnabled ?
          <ScrollView
            ref='calendar'
            horizontal={true}
            scrollEnabled={true}
            pagingEnabled={true}
            removeClippedSubviews={true}
            scrollEventThrottle={600}
            showsHorizontalScrollIndicator={false}
            automaticallyAdjustContentInsets={false}
            onMomentumScrollEnd={(event) => this._scrollEnded(event)}>
              {this.state.calendarDates.map((date) => {
                if (this.state.currentView == 'CurrentViewMonthView') {
                  return this._renderedMonth(date)
                }
                else {
                  return this._renderedWeek(date)
                }
              })}
          </ScrollView>
          :
          <View ref='calendar'>
            {this.state.calendarDates.map((date) => {
              if (this.state.currentView == 'CurrentViewMonthView') {
                return this._renderedMonth(date)
              }
              else {
                return this._renderedWeek(date)
              }
            })}
          </View>
        }
      </View>
    )
  }
});

var styles = StyleSheet.create({
  calendarContainer: {
    backgroundColor: '#FFFFFF',
  },
  monthContainer: {
    backgroundColor: '#FAFAFA',
    width: DEVICE_WIDTH,
    borderBottomWidth: 1,
    borderColor: '#E8E8E8'
  },
  calendarControls: {
    flex: 1,
    flexDirection: 'row',
    margin: 10,
  },
  controlButton: {
  },
  controlButtonText: {
    fontFamily: 'Avenir Next',
    fontSize: 15,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '500',
    fontFamily: 'Avenir Next',
  },
  calendarHeading: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderColor: '#E8E8E8'
  },
  dayHeading: {
    flex: 1,
    fontSize: 12,
    textAlign: 'center',
    paddingVertical: 2,
    backgroundColor: '#FAFAFA',
    fontFamily: 'Avenir Next',
  },
  weekendHeading: {
    flex: 1,
    fontSize: 12,
    textAlign: 'center',
    paddingVertical: 2,
    backgroundColor: '#FAFAFA',
    fontFamily: 'Avenir Next',
  },
  weekRowBlank: {
    flexDirection: 'row',
    borderWidth: 0,
  },
  weekRow: {
    borderTopWidth: 1,
    borderColor: '#E8E8E8',
    flexDirection: 'row',
  },
  weekRowMain: {
    borderTopWidth: 1,
    borderColor: '#E8E8E8',
    flexDirection: 'row',
  },
  dayButton: {
    alignItems: 'center',
    padding: 5,
    width: DEVICE_WIDTH / 7,
  },
  dayButtonFiller: {
    padding: 5,
    width: DEVICE_WIDTH / 7
  },
  day: {
    fontSize: 16,
    alignSelf: 'center',
    fontWeight: '500',
    fontFamily: 'Avenir Next',
  },
  eventIndicatorFiller: {
    marginTop: 3,
    borderColor: 'transparent',
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  eventIndicator: {
    backgroundColor: '#cccccc'
  },
  dayCircleFiller: {
    justifyContent: 'center',
    backgroundColor: 'transparent',
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  currentDayCircle: {
    backgroundColor: '#426FA3'
  },
  currentDayText: {
    fontWeight: 'bold',
    color: '#D0021B',
    fontFamily: 'Avenir Next',
  },
  selectedDayCircle: {
    backgroundColor: '#426FA3'
  },
  selectedDayText: {
    color: 'white',
    fontFamily: 'Avenir Next',
  },
  weekendDayText: {
    fontSize: 16,
    color: '#B0B0B0',
    fontFamily: 'Avenir Next',
  }
});

module.exports = Calendar;
